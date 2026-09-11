---
title: 论坛内容与搜索
sidebar_label: 内容与搜索
sidebar_position: 2
---

代码：`internal/domains/forum`。下列为**对外行为与设计边界**；排序权重、缓存键与 SQL 以实现为准，不在公开文档中固定公式。

## 1. 内容模型（概念）

| 概念 | 说明 |
|------|------|
| 板块 (Board) | 有稳定 `slug`、标题与描述 |
| 帖子 (Post) | 正文与标签等；标签适合多值存储 |
| 可见性 | 正常展示 / 隐藏（违规）/ 降权（质量较低时搜索与推荐权重下降） |

字段级定义以 OpenAPI 与 GORM 模型为准。

## 2. 列表与搜索行为

支持按关键词、板块等过滤，以及多种排序（如时间、热门）。

**热门排序**（行为约定）：

- 结合互动（赞、评等）与时间衰减，避免旧帖长期霸榜。  
- 具体系数与实现随版本调整；客户端只依赖「热门」语义，不依赖固定公式。  
- 服务端可对候选集做预取后再排序，以支持分页。

**关键词与标签**：

- 标题/正文检索与标签过滤均在服务端完成。  
- 存储与索引细节（全文、jsonb 等）以实现为准。

## 3. 缓存

- 高频、变更较少的元数据（如某板块标签列表）可缓存。  
- 写入导致标签变更时应失效相关缓存。  
- **Key 命名与 TTL 为内部实现，公开文档不保证稳定。**

## 4. 接入注意

- 板块/标签的 `slug` 应规范化（小写、连字符等），与创建接口校验一致。  
- 标题、正文长度上限以 OpenAPI / 服务端校验错误为准。  
- 列表接口的分页参数与最大 `limit` 以 OpenAPI 为准。

## 5. 帖子删除与 access_status 语义

- **作者自删受限**：`DeletePost` 先检查帖子的 `ModerationActionID`；被处置过（存在审核动作）的帖子作者自删返回 403，只能走申诉/审核流程（`repo/repo.go`）。  
- **access_status 计算**：帖子 API 输出的 `access_status` 由 `Visibility` / `ModerationStatus` / `ExpiresAt` 共同计算（`model/forum.go` 的 `computePostAccess`），取值：

| access_status | 条件 |
|---------------|------|
| `deleted` | `Visibility` 为已删除 |
| `hidden` | `Visibility` 为隐藏 |
| `pending_review` | `ModerationStatus` 为待审核 |
| `expired` | `ExpiresAt` 已过 |
| `active` | 以上均不满足 |

`access_status` 不再恒为 `active`；客户端应按该字段分支展示。

## 相关

- [论坛模块](./index.md)  
- [搜索](../search/index.md)  
