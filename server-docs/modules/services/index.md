---
title: 内部服务
sidebar_label: 概览
sidebar_position: 0
description: internal/services 进程内横切能力（AI、worker）
---

`internal/services/` 存放**进程内横切能力**（多业务域复用、不归属于单一业务域）。公开文档写**职责与边界**，实现细节见代码。

## 服务列表

| 包 | 职责 |
|----|------|
| `ai` | AI 管理器与调用封装（含 [内容审核](./content_moderation.md) 的模型调用） |
| `worker` | 后台任务队列与 worker（任务定义 `taskdef`） |

> [!NOTE]
> 统一搜索现为独立业务域 `internal/domains/search`，不再是 `services` 下的服务，见 [统一搜索](../search/index.md)。

## 相关

- [模块详解](../index.md)  
- [公开文档边界](../../meta/public_docs_policy.md)  
