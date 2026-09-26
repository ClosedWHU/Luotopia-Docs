---
title: 统一搜索
sidebar_label: 概览
sidebar_position: 0
---

代码：`internal/domains/search` + `search/service`（如 `pg_search.go`）。搜索域负责跨模块的数据检索与联想建议，屏蔽底层引擎差异。

## 核心架构

系统采用统一搜索服务（`UnifiedSearchService`）。目前主要基于 PostgreSQL 全文检索（FTS）。

### 作用域搜索

- **作用域（scope）**：当前仅 `courses` / `teachers` / `reviews`（名称以 API 为准）。
- **类型标记**：搜索结果注入 `_type` 字段，方便客户端按需渲染。
- **权重排序**：结果按相关度得分排序，支持分页（`limit` / `offset`）。

> 注意：联合检索（federated）目前**未严格支持**（`FederatedSearch` 返回不支持错误）；不要依赖跨课程 / 论坛 / 用户 / 资料的统一搜索。

### 搜索建议

- **联想**：提供课程名称、教师名称及评价摘要的快速联想。
- **性能**：联想接口经过多级缓存优化；缓存键与 TTL 为实现细节。

## 核心接口

`AdvancedSearch`（多维筛选）与 `SuggestCourses/Teachers/Reviews`（联想建议）；HTTP 路径与参数**完整端点见 [统一搜索接口参考](../../api/search.md)**。

## 技术实现

- **Postgres FTS**：`pg_trgm`、`tsvector`；若安装 **pg_jieba** 则优先 `jiebacfg`
- 可选**向量**检索（embedding 列 + HNSW，维度与模型以配置为准）
- 启动时尝试创建 / 对齐索引（失败多为 warn，不阻塞主业务）

索引与运维边界见 [搜索索引与全文检索](./indexing.md)。

## 扩展

语义 / 外部搜索引擎若引入，应通过统一搜索接口适配，并更新 OpenAPI。

## 相关

- [搜索索引与全文检索](./indexing.md)
- [内部服务](../services/index.md)
- [API 使用指南](../../api/overview.md)
