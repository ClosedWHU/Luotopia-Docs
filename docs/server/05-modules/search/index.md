# 搜索服务 (Search)

搜索服务是 Luotopia 的核心中枢之一，负责跨模块的数据检索与智能建议。

## 1. 核心架构
系统采用 **统一搜索服务 (`UnifiedSearchService`)** 模式，屏蔽了底层搜索引擎的差异。目前主要基于 **PostgreSQL 全文检索 (FTS)** 实现。

### 1.1 联合搜索 (Federated Search)
- **跨模块检索**: 一个接口即可同时搜索课程 (`course`)、帖子 (`forum`)、用户及学习资料。
- **类型标记**: 搜索结果会自动注入 `_type` 字段，方便客户端按需渲染。
- **权重排序**: 结果按相关度得分排序，支持分页 (`limit`/`offset`)。

### 1.2 搜索建议 (Suggestions)
- **智能联想**: 提供课程名称、教师名称及评价摘要的快速联想。
- **性能**: 联想接口经过多级缓存优化，支持亚秒级响应。

## 2. 核心接口
- **`AdvancedSearch`**: 支持多维参数筛选（如按校区、学期、分类）。
- **`FederatedSearch`**: 全文模糊搜索入口。
- **`SuggestCourses/Teachers/Reviews`**: 分类联想建议。

## 3. 技术实现 (`internal/services/search`)
- **Postgres 适配器**: 利用 `pg_trgm` 和 `tsvector` 实现高效的中英文混合搜索。
- **索引自动维护**: 服务启动时会自动执行 `SetupIndices()` 确保数据库搜索索引处于最新状态。

## 4. 后续扩展
- **Elasticsearch/Meilisearch**: 架构预留了适配器接口，未来可无缝切换至专用搜索引擎以应对海量数据。
- **AI 语义搜索**: 结合 `internal/services/ai` 的 Embedding 能力，实现基于向量的语义召回。

---
[返回目录](../index.md)
