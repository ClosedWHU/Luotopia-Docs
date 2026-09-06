---
title: 内部服务
sidebar_label: 概览
sidebar_position: 0
description: 搜索、审核、集成测试等内部服务约定
---

多业务域复用的基础设施服务。公开文档写**职责与边界**，实现细节见代码。

## 服务列表

### [搜索引擎服务](../search/index.md)

统一搜索入口（PostgreSQL FTS 等）。适用：课程、评价、论坛等需检索的域。

### [内容审核服务](./content_moderation.md)

UGC 检测与处理建议。词库与阈值不进公开文档。

### [集成测试](./integration_testing.md)

Postgres/Redis 集成测约定与 `go test` 入口。

## 相关

- [模块详解](../index.md)  
- [公开文档边界](../../meta/public_docs_policy.md)  
