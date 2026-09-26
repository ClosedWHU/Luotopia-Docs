---
title: 社交与私信
sidebar_label: 社交与私信
description: 关注 / 拉黑关系图与论坛私信
sidebar_position: 18
---

代码：`internal/domains/social`（OpenAPI Tag `Social`）。路径前缀 `/api/v1/social/*`。**字段与完整路径以 OpenAPI 为准**。

社交域承载论坛之外的关系图与私信：关注 / 拉黑决定「谁能私信谁、主页暴露什么」，私信是论坛帖子之外的一对一会话。将其独立成域，是为了让论坛写路径专注于帖子本身。

> [!NOTE]
> 旧「chat 域」已落为 `social` 域（私信 / 关注 / 拉黑），不存在 `internal/domains/chat`，见 [已移除与迁移](../meta/removed_and_migrated.md#尚未落地的-chat-域)。

## 能力

- **用户主页与关系**：公开主页、用户公开帖 / 评论 / 点赞 / 收藏、关注 / 取关、移除粉丝、关注 / 粉丝列表。
- **拉黑**：拉黑在写路径同时移除双方关注边，并限制私信。
- **私信**：会话列表、发私信、会话消息、标记已读、未读数。

单条私信上限 `MaxMessageLength = 4000`（低于帖子上限）。两人间会话唯一（`User1ID < User2ID` 归一），`IsRead` 仅表示接收方已读。

**完整端点见 [社交与私信接口参考](../api/social.md)**。

## 边界

- 均需登录（`AccessUser`）；写操作有操作级限流（`writeRate` / `messageRate`）。
- 私信不是论坛内容，不进入论坛信息流 / 审核路径；受拉黑关系约束。

## 相关

- [论坛模块](./forum/index.md)
- [模块详解](./index.md)
- [已移除与迁移](../meta/removed_and_migrated.md)
