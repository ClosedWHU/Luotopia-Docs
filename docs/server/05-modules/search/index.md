# PostgreSQL 全文搜索服务

Luotopia Server 的搜索功能由 `internal/services/search` 提供支持，采用 PostgreSQL 的内置全文搜索能力（tsvector/tsquery），为用户提供跨模块（课程、教师、评价、帖子）的高性能搜索体验。

## 1. 架构设计

搜索服务采用 **策略模式**，通过统一的 `SearchEngine` 接口封装搜索实现。当前使用 PostgreSQL 作为主要的搜索后端：

- **PgSearchService**: 基于 PostgreSQL 的 tsvector/tsquery 全文搜索实现
- **SearchEngine 接口**: 提供标准化的搜索接口
- **UnifiedSearchService**: 统一入口，管理具体实现的选择

## 2. 搜索范围

| 范围 | 表 | 搜索字段 |
|-----|-----|--------|
| `courses` | courses | name, code, department, description |
| `teachers` | teachers | name, department |
| `posts` | posts | title, content |
| `reviews` | reviews | title, content |

## 3. 全文搜索原理

PostgreSQL 通过 tsvector（文本向量）和 tsquery（查询）进行全文搜索：

```sql
-- 创建 GIN 索引加速搜索
CREATE INDEX idx_posts_tsvector ON posts USING GIN(
  to_tsvector('simple', title || ' ' || content)
);

-- 执行搜索
SELECT * FROM posts
WHERE to_tsvector('simple', title || ' ' || content) @@ to_tsquery('simple', 'golang:*')
LIMIT 20;
```

## 4. API 接口规范

统一搜索接口支持以下参数：

- `q` 或 `query`: 搜索关键词
- `scope`: 搜索范围（courses、teachers、posts、reviews、all）
- `limit`/`offset`: 分页参数
- 其他过滤参数：根据scope动态支持（如 department、semester等）

## 5. 性能优化

- **GIN 索引**: 为搜索字段创建 GIN 索引，查询速度 <50ms
 - **GIN 索引**: 为搜索字段创建 GIN 索引，查询速度 &lt;50ms
- **缓存**: 热门搜索结果缓存 5 分钟
- **分页**: 强制限制单次查询结果数量（最多100）

详见 [全文搜索引擎](./search_engine.md)、[搜索索引](./indexing.md) 和 [性能调优](../performance_tuning.md)

---

[返回目录](../index.md)
