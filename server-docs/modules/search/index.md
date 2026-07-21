---
title: 统一搜索
sidebar_label: 概览
sidebar_position: 0
---

# 搜索服务

搜索服务是 Luotopia 的核心中枢之一，负责跨模块的数据检索与智能建议。

## 1. 核心架构
系统采用统一搜索服务（`UnifiedSearchService`），屏蔽底层引擎差异。目前主要基于 PostgreSQL 全文检索（FTS）。

### 1.1 联合搜索
- **跨模块检索**: 一个接口即可同时搜索课程 (`course`)、帖子 (`forum`)、用户及学习资料。
- **类型标记**: 搜索结果会自动注入 `_type` 字段，方便客户端按需渲染。
- **权重排序**: 结果按相关度得分排序，支持分页 (`limit`/`offset`)。

### 1.2 搜索建议
- **智能联想**: 提供课程名称、教师名称及评价摘要的快速联想。
- **性能**: 联想接口经过多级缓存优化，支持亚秒级响应。

## 2. 核心接口
- **`AdvancedSearch`**: 支持多维参数筛选（如按校区、学期、分类）。
- **`FederatedSearch`**: 全文模糊搜索入口。
- **`SuggestCourses/Teachers/Reviews`**: 分类联想建议。

## 3. 技术实现

- 代码：`internal/domains/search` + `search/service`（如 `pg_search.go`）  
- **Postgres FTS**：`pg_trgm`、`tsvector`；若安装 **pg_jieba** 则优先 `jiebacfg`  
- 可选 **向量** 检索（embedding 列 + HNSW，维度与模型以配置为准）  
- 启动时尝试创建/对齐索引（失败多为 warn，不阻塞主业务）

## 4. 扩展

语义 / 外部搜索引擎若引入，应通过统一搜索接口适配，并更新 OpenAPI。

---
[返回目录](../index.md)
