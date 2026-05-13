# PostgreSQL 全文搜索服务

Luotopia 的搜索功能基于 **PostgreSQL 内置的全文搜索** 实现，无需外部搜索引擎依赖，直接利用数据库的 `tsvector` 和 `tsquery` 功能。

## 架构设计

### 核心接口

所有搜索实现都必须遵循 `SearchEngine` 接口：

```go
package search

// SearchEngine 定义了搜索引擎的标准接口
type SearchEngine interface {
	// Advanced search with parameters
	AdvancedSearch(params map[string]interface{}, scope string) ([]map[string]interface{}, int64, error)
	
	// Federated search across multiple scopes
	FederatedSearch(query string, limit int, offset int, params map[string]interface{}) ([]map[string]interface{}, int64, error)
	
	// Random search with optional filters
	RandomSearch(indexName string, limit int, filters map[string]interface{}) ([]map[string]interface{}, error)
	RandomSearchWithSeed(indexName string, limit int, seed int64, filters map[string]interface{}) ([]map[string]interface{}, error)
	
	// Suggestion operations
	SuggestCourses(query string, limit int) ([]string, error)
	SuggestReviews(query string, limit int) ([]string, error)
	SuggestTeachers(query string, limit int) ([]string, error)
	
	// Setup and health check
	SetupIndices() error
	IsHealthy() bool
}
```

### PostgreSQL 全文搜索原理

PostgreSQL 提供了内置的全文搜索能力，基于 `tsvector`（文本搜索向量）和 `tsquery`（文本搜索查询）类型：

```sql
-- 创建全文搜索索引
CREATE INDEX idx_courses_search ON courses USING GIN(to_tsvector('simple', name || ' ' || coalesce(code, '') || ' ' || coalesce(department, '')));

-- 执行搜索查询
SELECT * FROM courses 
WHERE to_tsvector('simple', name || ' ' || code || ' ' || department) @@ to_tsquery('simple', 'golang:*')
LIMIT 20;
```

### UnifiedSearchService

```go
// UnifiedSearchService 统一搜索服务，包装了 PgSearchService
type UnifiedSearchService struct {
	engine SearchEngine
}

// 初始化时选择后端
func NewUnifiedSearchService() *UnifiedSearchService {
	zap.L().Info("Initializing search service (Postgres only)")
	engine, err := NewPgSearchService()
	if err != nil {
		zap.L().Fatal("Failed to create Postgres search service", zap.Error(err))
	}
	return &UnifiedSearchService{engine: engine}
}
```

## 搜索范围与支持

### 搜索范围（Scopes）

系统支持以下搜索范围：

| 范围 | 表名 | 搜索字段 | 说明 |
|------|------|--------|------|
| `courses` | `courses` | name, code, department, description | 按课程名称、代码、部门、描述搜索 |
| `teachers` | `teachers` | name, department | 按教师名称、所属部门搜索 |
| `reviews` | `reviews` | title, content | 按评价标题和内容搜索 |
| `all` | 多表 | 混合 | 一次性搜索所有范围 |

### 查询构建

搜索使用通配符查询，自动添加前缀匹配：

```go
// buildTsQuery 将用户查询转换为 PostgreSQL tsquery 格式
func (s *PgSearchService) buildTsQuery(query string) string {
	terms := strings.Fields(query)  // 分词
	for i, term := range terms {
		terms[i] = term + ":*"       // 添加前缀通配符
	}
	return strings.Join(terms, " & ") // 使用 AND 连接
}

// 示例：
// 输入: "golang web"
// 输出: "golang:* & web:*"
// 这会匹配所有以 "golang" 或 "web" 开头的词
```

## 查询方式

### 简单搜索

```go
results, total, err := searchService.AdvancedSearch(map[string]interface{}{
	"query": "golang",
	"scope": "courses",
	"limit": 20,
	"offset": 0,
}, "courses")
```

对应的 SQL：
```sql
SELECT * FROM courses 
WHERE to_tsvector('simple', name || ' ' || code || ' ' || department || ' ' || description) 
      @@ to_tsquery('simple', 'golang:*')
LIMIT 20 OFFSET 0;
```

### 高级搜索（带过滤器）

```go
results, total, err := searchService.AdvancedSearch(map[string]interface{}{
	"query":      "golang",
	"scope":      "courses",
	"department": "计算机",
	"limit":      20,
	"offset":     0,
}, "courses")
```

对应的 SQL：
```sql
SELECT * FROM courses 
WHERE to_tsvector('simple', name || ' ' || code || ' ' || department || ' ' || description) 
      @@ to_tsquery('simple', 'golang:*')
  AND department = '计算机'
LIMIT 20 OFFSET 0;
```

### 随机搜索

```go
// 随机返回符合条件的课程
results, err := searchService.RandomSearch("courses", 10, map[string]interface{}{
	"department": "计算机",
})

// 带种子的随机搜索（可重现的随机顺序）
results, err := searchService.RandomSearchWithSeed("courses", 10, 12345, map[string]interface{}{})
```

### 建议搜索

```go
// 获取课程建议
suggestions, err := searchService.SuggestCourses("golang", 10)
// 返回: ["golang编程", "golang web", "golang高性能"]

// 获取教师建议
suggestions, err := searchService.SuggestTeachers("Li", 10)
// 返回: ["李教授", "李明", "李红"]

// 获取评价建议
suggestions, err := searchService.SuggestReviews("难度", 10)
// 返回: ["难度很高", "难度适中", "难度偏低"]
```

## 故障排查

### 问题 1: 搜索无结果或结果不完整

**可能原因**：
- 查询词与数据库内容完全不匹配
- PostgreSQL 全文搜索索引未生成
- 数据未正确存储或为空

**诊断步骤**：
```sql
-- 检查表中是否有数据
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM teachers;
SELECT COUNT(*) FROM reviews;

-- 手动测试全文搜索
SELECT name FROM courses 
WHERE to_tsvector('simple', name || ' ' || code) @@ to_tsquery('simple', 'golang:*')
LIMIT 5;

-- 检查数据内容
SELECT name, code FROM courses WHERE name LIKE '%golang%';
```

### 问题 2: 搜索返回过多结果

**可能原因**：
- 查询词太通用（如"课程"）
- 前缀匹配导致无关结果被包含
- 缺少必要的过滤条件

**解决方案**：
```go
// 方案 1: 使用更具体的查询词
// 不好: "课程" -> 返回 1000+ 结果
// 好: "golang课程" -> 返回 50+ 结果

// 方案 2: 添加过滤条件
results, total, err := searchService.AdvancedSearch(map[string]interface{}{
	"query":      "课程",
	"scope":      "courses",
	"department": "计算机科学与技术",
	"limit":      20,
}, "courses")

// 方案 3: 实现前端分页和限制
// API 层应强制限制 limit（最多 100）
```

### 问题 3: 搜索速度慢

**可能原因**：
- 缺少合适的索引
- 表数据过多，全表扫描
- 复杂的过滤条件

**优化方案**：

```sql
-- 1. 为常用搜索字段创建 GIN 索引（已在迁移中）
CREATE INDEX idx_courses_tsvector ON courses USING GIN(to_tsvector('simple', name || ' ' || code || ' ' || department));

-- 2. 为过滤字段创建常规索引
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_courses_status ON courses(status);

-- 3. 分析查询计划，找到瓶颈
EXPLAIN ANALYZE SELECT * FROM courses 
WHERE to_tsvector('simple', name || ' ' || code) @@ to_tsquery('simple', 'golang:*')
  AND department = '计算机';
```

## 缓存策略

由于 PostgreSQL 全文搜索的查询速度通常很快，建议在应用层进行缓存：

```go
// 热门搜索结果缓存（Redis）
const searchCacheTTL = 5 * time.Minute

func (s *SearchService) Search(ctx context.Context, query string, scope string) (*Result, error) {
	cacheKey := fmt.Sprintf("search:%s:%s", query, scope)
	
	// 尝试从 Redis 读取
	if cached, err := s.cache.Get(ctx, cacheKey); err == nil {
		return cached.(*Result), nil
	}
	
	// 执行数据库搜索
	result, err := s.engine.AdvancedSearch(map[string]interface{}{
		"query": query,
		"scope": scope,
		"limit": 20,
	}, scope)
	if err != nil {
		return nil, err
	}
	
	// 缓存成功结果
	s.cache.Set(ctx, cacheKey, result, searchCacheTTL)
	
	return result, nil
}
```

## 监控指标

关键指标需要纳入 Prometheus 监控：

```prometheus
# 搜索请求数（按范围分组）
search_requests_total{scope="courses",status="success"}

# 搜索延迟（毫秒）
search_request_duration_ms{scope="courses",quantile="0.95"}

# 搜索缓存命中率
search_cache_hit_ratio{scope="courses"}

# 搜索结果数统计
search_results_count{scope="courses",bucket="0-10"}
search_results_count{scope="courses",bucket="10-50"}
search_results_count{scope="courses",bucket="50+"}
```

## 性能特点

| 指标 | PostgreSQL 全文搜索 | 说明 |
|------|-------------------|------|
| 查询速度 | 毫秒级 | GIN 索引下，通常 &lt;50ms |
| 内存占用 | 低 | 无需维护独立搜索进程 |
| 部署复杂度 | 低 | 无需额外组件 |
| 支持的语言 | 多语言 | 通过不同的语言配置 |
| 实时性 | 完全实时 | 数据库更新即刻生效 |
| 扩展性 | 中 | 受数据库规模限制 |

---

[返回服务列表](./index.md)
