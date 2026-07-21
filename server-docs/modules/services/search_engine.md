---
title: 搜索服务
sidebar_label: 搜索服务
sidebar_position: 1
---
# 搜索服务

基于 **PostgreSQL FTS**（`tsvector` / `tsquery`），可选 **pg_trgm**、**pg_jieba**、**pgvector**。  
实现目录：`internal/domains/search/service`。DB 镜像见 `Dockerfile.db`。

> 公开文档描述**接口职责与行为**；不粘贴完整实现或生产 SQL 手册。

## 职责

统一搜索入口，供课程、教师、评价等业务调用，避免各域重复拼 FTS 条件。

典型能力（方法名以实现为准）：

| 能力 | 说明 |
|------|------|
| 作用域搜索 | 单 scope + 关键词 + 分页 + 过滤 |
| 联合搜索 | 多 scope 聚合（若启用） |
| 随机 | 随机样本；可选 seed 便于复现顺序 |
| 建议 | 课程 / 教师 / 评价等补全 |
| 健康 / 索引初始化 | 启动时建索引、探活 |

## 搜索范围（Scopes）

| 范围（示例） | 用途 |
|--------------|------|
| `courses` | 课程名、代码、院系、描述等 |
| `teachers` | 教师名、院系等 |
| `reviews` | 评价标题与正文等 |

具体字段集合以实现与迁移为准。

## HTTP 与客户端

- 对外 REST 以 **OpenAPI** 为准（`/api/v1/search` 等，若已暴露）。  
- 内部 Go 服务通过本域 service 调用，http 层不直连他域 repo。  
- 强制合理 `limit`（上限见 API 校验）。

## 运维注意

| 项 | 说明 |
|----|------|
| 扩展 | 库需支持所用 FTS / trgm / vector |
| 无结果 | 先确认数据与鉴权，再查分词配置 |
| 过慢 | 分页、过滤、避免超宽查询词 |
| 缓存 | 可选；key/TTL 非公开契约 |

## 相关

- [索引说明](../search/indexing.md)  
- [搜索模块](../search/index.md)  
