# 性能调优指南

本指南介绍如何对 Luotopia 系统进行性能调优，包括数据库优化、缓存策略、搜索引擎优化等。

## 1. 数据库性能优化

### 1.1 索引策略

关键表应建立适当的索引以加快查询速度：

```sql
-- 论坛模块
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX idx_posts_status ON posts(status) WHERE status != 'deleted';

-- 课程模块
CREATE INDEX idx_courses_semester ON courses(semester);
CREATE INDEX idx_course_reviews_course ON course_reviews(course_id, rating DESC);

-- 用户认证
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status) WHERE status = 'active';

-- 搜索与分析
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);  -- 全文搜索
CREATE INDEX idx_events_created ON events(created_at DESC) WHERE event_type = 'audit';
```

**最佳实践**:
- 为常用的 WHERE、JOIN、ORDER BY 字段建立索引
- 避免过多索引（增加写入成本）
- 定期分析索引使用情况：`ANALYZE table_name;`

### 1.2 查询优化

```go
// ❌ 不推荐：N+1 查询问题
for _, post := range posts {
    author := db.Query("SELECT * FROM users WHERE id = ?", post.AuthorID)
}

// ✅ 推荐：使用 JOIN 一次查询
db.Query(`
    SELECT p.*, u.name, u.avatar 
    FROM posts p 
    JOIN users u ON p.user_id = u.id
    LIMIT 50
`)

// ✅ 推荐：批量预加载
var posts []Post
db.Preload("Author").Preload("Comments").Find(&posts)
```

### 1.3 连接池配置

```go
// PostgreSQL 连接池优化
import "database/sql"

db, _ := sql.Open("postgres", dsn)

// 根据并发数调整连接数
db.SetMaxOpenConns(25)        // 最大连接数
db.SetMaxIdleConns(5)         // 保持的空闲连接数
db.SetConnMaxLifetime(5 * time.Minute)  // 连接最长使用时间

// 监控连接池状态
stats := db.Stats()
log.Printf(
    "连接池: 开放=%d, 使用=%d, 等待=%d",
    stats.OpenConnections,
    stats.InUse,
    stats.WaitCount,
)
```

### 1.4 数据库分析与监控

```sql
-- 查看表和索引大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看慢查询
SELECT
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- 超过 100ms 的查询
ORDER BY mean_exec_time DESC;

-- 查看索引使用情况
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 2. 缓存策略

### 2.1 Redis 缓存分层

```go
// 三层缓存：应用内存 → Redis → 数据库
type CacheManager struct {
    memory  *lru.Cache           // 进程内缓存（小）
    redis   *redis.Client        // 分布式缓存（中）
    db      *sql.DB              // 数据库（大）
}

func (cm *CacheManager) GetPost(ctx context.Context, id uint64) (*Post, error) {
    // L1: 进程内存（10ms TTL）
    if cached, ok := cm.memory.Get(fmt.Sprintf("post:%d", id)); ok {
        return cached.(*Post), nil
    }
    
    // L2: Redis 缓存（1 小时 TTL）
    if data, err := cm.redis.Get(ctx, fmt.Sprintf("post:%d", id)).Result(); err == nil {
        post := &Post{}
        json.Unmarshal([]byte(data), post)
        cm.memory.Add(fmt.Sprintf("post:%d", id), post)
        return post, nil
    }
    
    // L3: 数据库查询
    post, err := cm.db.GetPost(id)
    if err == nil {
        // 双写缓存
        cm.memory.Add(fmt.Sprintf("post:%d", id), post)
        cm.redis.Set(ctx, fmt.Sprintf("post:%d", id), post, 1*time.Hour)
    }
    
    return post, err
}
```

### 2.2 缓存失效策略

```go
// 主动失效（推荐）
func (s *PostService) UpdatePost(ctx context.Context, id uint64, data *UpdateRequest) error {
    post, err := s.postRepo.Update(ctx, id, data)
    if err != nil {
        return err
    }
    
    // 删除相关缓存
    s.cache.Delete(ctx, fmt.Sprintf("post:%d", id))
    s.cache.Delete(ctx, fmt.Sprintf("posts:author:%d", post.AuthorID))
    s.cache.Delete(ctx, "posts:trending")
    
    // 发送消息队列通知其他服务
    s.eventBus.Publish("post.updated", post)
    
    return nil
}
```

### 2.3 缓存预热

```go
// 应用启动时预热热数据
func WarmupCache(ctx context.Context, cache cache.Cache, db *sql.DB) error {
    // 预热热门课程
    courses, _ := db.GetTopCourses(ctx, 100)
    for _, course := range courses {
        cache.Set(ctx, fmt.Sprintf("course:%d", course.ID), course, 24*time.Hour)
    }
    
    // 预热常用用户信息
    activeUsers, _ := db.GetActiveUsers(ctx, 1000)
    for _, user := range activeUsers {
        cache.Set(ctx, fmt.Sprintf("user:%d", user.ID), user, 12*time.Hour)
    }
    
    log.Printf("缓存预热完成: %d 个课程, %d 个用户", len(courses), len(activeUsers))
    return nil
}
```

## 3. PostgreSQL 全文搜索优化

### 3.1 全文搜索索引配置

全文搜索通过 PostgreSQL 的 GIN 索引实现，应在数据库迁移中创建：

```sql
-- 为核心表创建全文搜索索引
CREATE INDEX idx_posts_tsvector ON posts USING GIN(
    to_tsvector('simple', title || ' ' || coalesce(content, ''))
);

CREATE INDEX idx_courses_tsvector ON courses USING GIN(
    to_tsvector('simple', name || ' ' || coalesce(code, '') || ' ' || coalesce(description, ''))
);

CREATE INDEX idx_teachers_tsvector ON teachers USING GIN(
    to_tsvector('simple', name || ' ' || coalesce(department, ''))
);

-- 为过滤条件创建附加索引
CREATE INDEX idx_posts_author_status ON posts(user_id, status) WHERE status = 'published';
CREATE INDEX idx_courses_semester ON courses(semester);
CREATE INDEX idx_courses_department ON courses(department);
```

**索引说明**:
- GIN (Generalized Inverted Index) 用于全文搜索，支持快速的 `@@` 操作
- `to_tsvector('simple', ...)` 使用简单的词汇化，不依赖语言库
- 可选字段使用 `coalesce()` 避免 NULL 值
- 附加索引加速过滤条件

### 3.2 搜索查询优化

```go
// ❌ 不推荐：过于宽泛的查询，可能返回大量结果
search("课程")  // 可能匹配数千条记录

// ✅ 推荐：使用具体的查询词和过滤条件
search("golang", scope="courses", department="计算机科学", limit=20)

// ✅ 推荐：实现分页
results, total, _ := searchService.AdvancedSearch(map[string]interface{}{
    "query": "golang",
    "scope": "courses",
    "department": "计算机科学",
    "limit": 20,
    "offset": 0,  // 第一页
}, "courses")

// 第二页
offset := 20
results, total, _ := searchService.AdvancedSearch(map[string]interface{}{
    "query": "golang",
    "offset": offset,
    "limit": 20,
}, "courses")
```

**搜索范围和字段**:

| 范围 | 表 | 搜索字段 |
|-----|-----|--------|
| `courses` | courses | name, code, description |
| `teachers` | teachers | name, department |
| `posts` | posts | title, content |

### 3.3 查询计划分析

使用 `EXPLAIN ANALYZE` 诊断慢查询：

```sql
-- 分析搜索查询执行计划
EXPLAIN ANALYZE 
SELECT * FROM posts 
WHERE to_tsvector('simple', title || ' ' || content) @@ to_tsquery('simple', 'golang:*')
  AND status = 'published'
LIMIT 20;

-- 输出示例：
-- Index Scan using idx_posts_tsvector on posts
-- Index Cond: (to_tsvector(...) @@ to_tsquery(...))
-- Filter: (status = 'published')
-- Execution Time: 12.345 ms
```

**优化指标**:
- 如果 `Execution Time > 100ms`，说明需要优化
- 查看是否使用了索引（Index Scan 优于 Seq Scan）
- 检查 Filter 是否可以转换为索引条件

### 3.4 性能调优参数

```sql
-- 调整查询规划参数以优先使用索引
ALTER SYSTEM SET random_page_cost = 1.0;  -- 对 SSD 友好

-- 提高工作内存，加速排序和 Hash
ALTER SYSTEM SET work_mem = '256MB';

-- 重新加载配置
SELECT pg_reload_conf();
```

## 4. API 响应优化

### 4.1 数据库查询优化

```go
// 只查询必要的字段
db.Select("id", "title", "author_id", "created_at").
    Where("status = ?", "published").
    Limit(20).
    Find(&posts)

// 使用数据库端分页而不是应用端
db.Offset((page - 1) * limit).
    Limit(limit).
    Find(&posts)
```

### 4.2 字段级缓存

```go
func (s *PostService) GetPostDetail(ctx context.Context, id uint64) (*PostDetail, error) {
    // 基础信息从缓存读取
    post, _ := s.getFromCache(ctx, id)
    
    // 相关数据异步加载
    go func() {
        s.loadComments(ctx, id)
        s.loadRelatedPosts(ctx, post.Tags)
    }()
    
    return post, nil
}
```

### 4.3 响应压缩

```go
// 启用 Gzip 压缩
router.Use(middleware.GzipMiddleware())

// 或手动配置
handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
        w.Header().Set("Content-Encoding", "gzip")
        gz := gzip.NewWriter(w)
        defer gz.Close()
        w = &gzipResponseWriter{Writer: gz, ResponseWriter: w}
    }
})
```

## 5. 并发与同步优化

### 5.1 请求并发控制

```go
// 限制并发请求数
type RateLimiter struct {
    limiter chan struct{}
    timeout time.Duration
}

func NewRateLimiter(maxConcurrent int, timeout time.Duration) *RateLimiter {
    return &RateLimiter{
        limiter: make(chan struct{}, maxConcurrent),
        timeout: timeout,
    }
}

func (rl *RateLimiter) Do(ctx context.Context, fn func() error) error {
    select {
    case rl.limiter <- struct{}{}:
        defer func() { <-rl.limiter }()
        return fn()
    case <-time.After(rl.timeout):
        return fmt.Errorf("rate limit exceeded")
    case <-ctx.Done():
        return ctx.Err()
    }
}
```

### 5.2 数据同步批处理

```go
// 批处理而不是逐条处理
const batchSize = 1000

func (s *SyncService) SyncPosts(ctx context.Context) error {
    lastID := uint64(0)
    for {
        posts, err := s.postRepo.GetByIDRange(ctx, lastID, batchSize)
        if err != nil {
            return err
        }
        
        if len(posts) == 0 {
            break
        }
        
        // 批量索引
        s.searchEngine.Index(ctx, "posts", convertToIndexDocs(posts))
        
        lastID = posts[len(posts)-1].ID
    }
    
    return nil
}
```

## 6. 监控和分析

### 6.1 关键指标

```prometheus
# API 响应时间
histogram_quantile(0.95, http_request_duration_seconds)

# 数据库连接数
pg_stat_activity_count{state="active"}

# 缓存命中率
cache_hits / (cache_hits + cache_misses)

# 搜索延迟
histogram_quantile(0.95, search_request_duration_ms)

# 错误率
rate(http_requests_total{status=~"5.."}[5m])
```

### 6.2 性能基准测试

```bash
# 使用 Apache Bench 进行压力测试
ab -n 10000 -c 100 http://localhost:8080/api/v1/posts

# 使用 wrk 进行负载测试
wrk -t12 -c400 -d30s http://localhost:8080/api/v1/posts

# 使用 vegeta 进行渐进式压力测试
echo "GET http://localhost:8080/api/v1/posts" | vegeta attack -duration=30s -rate=100 | vegeta report
```

## 7. 常见性能问题

| 问题 | 症状 | 解决方案 |
|------|------|--------|
| N+1 查询 | 查询缓慢，数据库连接溢满 | 使用 JOIN 或 Preload，批量查询 |
| 缺少索引 | 特定查询非常慢 | 分析慢查询日志，添加索引 |
| 缓存未命中 | CPU 和 I/O 利用率高 | 实现多层缓存，预热缓存 |
| 搜索超时 | 搜索请求响应慢 | 增加过滤条件，减少返回结果数 |
| 内存溢出 | 应用 OOM | 减少缓存大小，增加分页限制 |
| 连接耗尽 | 数据库连接被占满 | 调整连接池参数，优化查询 |

---

[返回开发指南](./02-development/index.md)
