# PostgreSQL 全文搜索实现

Luotopia 的搜索功能基于 PostgreSQL 内置的全文搜索能力实现，无需外部搜索引擎组件。

## 1. 搜索原理

### 1.1 tsvector 和 tsquery

PostgreSQL 提供了两个核心概念：

- **tsvector** (Text Search Vector): 预处理的文本，分词后去除停用词，适合存储和索引
- **tsquery** (Text Search Query): 搜索查询，定义要查找的词和操作符

### 1.2 搜索流程

当业务数据（如课程、评价）查询时：

1. **用户输入**: 用户在搜索框输入查询词
2. **分词处理**: 系统将输入分割为多个词，添加前缀通配符（`:*`）
3. **构建 tsquery**: 将多个词使用 AND 操作符 (`&`) 连接
4. **执行匹配**: 使用 `@@` 操作符在 tsvector 上执行匹配查询
5. **返回结果**: 返回匹配的记录

## 2. 实现细节

### 2.1 查询构建示例

```go
func (s *PgSearchService) buildTsQuery(query string) string {
	// 输入: "golang web framework"
	// 处理: 分词
	terms := strings.Fields(query)
	// 结果: ["golang", "web", "framework"]
	
	// 为每个词添加前缀通配符
	for i, term := range terms {
		terms[i] = term + ":*"
	}
	// 结果: ["golang:*", "web:*", "framework:*"]
	
	// 使用 AND 连接
	return strings.Join(terms, " & ")
	// 最终结果: "golang:* & web:* & framework:*"
}
```

### 2.2 搜索查询示例

```go
func (s *PgSearchService) AdvancedSearch(params map[string]interface{}, scope string) ([]map[string]interface{}, int64, error) {
	query, _ := params["query"].(string)
	limit := params["limit"].(int)
	offset := params["offset"].(int)
	
	tx := s.db.Table(scope)
	
	// 为不同的表构建不同的搜索字段组合
	if query != "" {
		tsQuery := s.buildTsQuery(query)
		
		switch scope {
		case "courses":
			// 在课程名称、代码、部门和描述中搜索
			tx = tx.Where(
				"to_tsvector('simple', name || ' ' || coalesce(code, '') || ' ' || coalesce(department, '') || ' ' || coalesce(description, '')) @@ to_tsquery('simple', ?)",
				tsQuery,
			)
		case "teachers":
			// 在教师名称和部门中搜索
			tx = tx.Where(
				"to_tsvector('simple', name || ' ' || coalesce(department, '')) @@ to_tsquery('simple', ?)",
				tsQuery,
			)
		case "reviews":
			// 在评价标题和内容中搜索
			tx = tx.Where(
				"to_tsvector('simple', title || ' ' || content) @@ to_tsquery('simple', ?)",
				tsQuery,
			)
		}
	}
	
	// 动态添加过滤条件
	for k, v := range params {
		if k == "query" || k == "limit" || k == "offset" || k == "page" {
			continue
		}
		if v != "" && v != nil {
			tx = tx.Where(fmt.Sprintf("%s = ?", k), v)
		}
	}
	
	// 计数
	var total int64
	tx.Count(&total)
	
	// 分页查询
	var results []map[string]interface{}
	tx.Limit(limit).Offset(offset).Find(&results)
	
	return results, total, nil
}
```

## 3. 搜索范围与配置

### 3.1 支持的搜索范围

| 范围 | 表 | 搜索字段 |
|------|-----|--------|
| `courses` | courses | name, code, department, description |
| `teachers` | teachers | name, department |
| `reviews` | reviews | title, content |
| `all` | 多表 | 所有上述字段 |

### 3.2 数据库索引

在生产环境中应创建 GIN 索引加快全文搜索：

```sql
-- 课程搜索索引（应在 DB 迁移中创建）
CREATE INDEX idx_courses_tsvector ON courses USING GIN(
	to_tsvector('simple', name || ' ' || coalesce(code, '') || ' ' || coalesce(department, '') || ' ' || coalesce(description, ''))
);

-- 教师搜索索引
CREATE INDEX idx_teachers_tsvector ON teachers USING GIN(
	to_tsvector('simple', name || ' ' || coalesce(department, ''))
);

-- 评价搜索索引
CREATE INDEX idx_reviews_tsvector ON reviews USING GIN(
	to_tsvector('simple', title || ' ' || content)
);
```

## 4. 查询示例

### 4.1 简单搜索

```bash
# 搜索课程
curl "http://localhost:8080/api/v1/search?q=golang&scope=courses&limit=20&offset=0"

# 响应示例：
{
	"courses": [
		{
			"id": 123,
			"name": "Golang Web 开发",
			"code": "CS201",
			"department": "计算机科学"
		}
	],
	"total": 5
}
```

### 4.2 高级搜索（带过滤）

```bash
# 搜索特定部门的课程
curl "http://localhost:8080/api/v1/search?q=golang&scope=courses&department=计算机科学&limit=20"

# 对应的 SQL：
# SELECT * FROM courses 
# WHERE to_tsvector('simple', name || ' ' || code || ' ' || department || ' ' || description) @@ to_tsquery('simple', 'golang:*')
#   AND department = '计算机科学'
# LIMIT 20;
```

### 4.3 建议搜索

```bash
# 获取课程建议
curl "http://localhost:8080/api/v1/courses/suggest?q=golang&limit=10"

# 获取教师建议
curl "http://localhost:8080/api/v1/teachers/suggest?q=Li&limit=10"
```

## 5. 性能考虑

### 5.1 查询性能

| 操作 | 耗时 | 说明 |
|------|------|------|
| 简单搜索（有索引） | &lt;50ms | GIN 索引下，查询通常很快 |
| 带过滤的搜索 | &lt;100ms | 额外的 WHERE 条件会增加耗时 |
| 大结果集（>1000） | 100-500ms | 结果集过大时需要考虑分页 |

### 5.2 优化建议

```go
// ❌ 不好：过于宽泛的查询
search("课程", "all", limit=1000)  // 可能匹配数万条结果

// ✅ 好：具体的查询词和过滤条件
search("golang", scope="courses", department="计算机", limit=20)

// ✅ 好：使用分页
search("golang", scope="courses", limit=20, offset=0)  // 第一页
search("golang", scope="courses", limit=20, offset=20) // 第二页
```

### 5.3 缓存策略

```go
// 热门搜索结果缓存（应用层）
const searchCacheTTL = 5 * time.Minute

cacheKey := fmt.Sprintf("search:%s:%s", query, scope)
if cached, _ := cache.Get(cacheKey); cached != nil {
	return cached  // 命中缓存，直接返回
}

// 执行数据库搜索
results, _ := searchService.Search(query, scope)

// 缓存结果
cache.Set(cacheKey, results, searchCacheTTL)
```

## 6. 故障诊断

### 6.1 搜索返回无结果

```sql
-- 检查数据是否存在
SELECT COUNT(*) FROM courses;

-- 手动测试搜索
SELECT * FROM courses 
WHERE to_tsvector('simple', name) @@ to_tsquery('simple', 'golang:*');

-- 如果手动查询也无结果，说明数据中确实没有该词
-- 如果手动查询有结果但应用层无，可能是参数转换问题
```

### 6.2 搜索结果不完整

```sql
-- 检查是否有软删除数据
SELECT COUNT(*) FROM courses WHERE deleted_at IS NOT NULL;

-- 搜索时应排除已删除的数据
SELECT * FROM courses 
WHERE deleted_at IS NULL
  AND to_tsvector('simple', name) @@ to_tsquery('simple', 'golang:*');
```

### 6.3 搜索性能问题

```sql
-- 查看索引是否存在
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('courses', 'teachers', 'reviews');

-- 分析查询执行计划
EXPLAIN ANALYZE SELECT * FROM courses 
WHERE to_tsvector('simple', name) @@ to_tsquery('simple', 'golang:*');
```

## 7. 与搜索服务的集成

### 7.1 调用搜索服务

```go
// 初始化搜索服务
searchService := search.NewUnifiedSearchService()

// 执行搜索
results, total, err := searchService.AdvancedSearch(map[string]interface{}{
	"query": "golang",
	"scope": "courses",
	"limit": 20,
	"offset": 0,
}, "courses")

// 获取建议
suggestions, _ := searchService.SuggestCourses("golang", 10)
```

### 7.2 建议搜索实现

```go
// SuggestCourses 返回匹配的课程名称建议
func (s *PgSearchService) SuggestCourses(query string, limit int) ([]string, error) {
	var suggestions []string
	
	// 构建搜索查询
	tsQuery := s.buildTsQuery(query)
	
	// 查询匹配的课程名称
	err := s.db.Table("courses").
		Where("to_tsvector('simple', name) @@ to_tsquery('simple', ?)", tsQuery).
		Limit(limit).
		Pluck("name", &suggestions).Error
	
	return suggestions, err
}
```

---

[返回目录](./index.md)
