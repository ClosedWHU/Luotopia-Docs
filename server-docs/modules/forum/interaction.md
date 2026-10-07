---
title: 论坛互动系统
sidebar_label: 互动系统
sidebar_position: 3
---

代码：`internal/domains/forum`（`repo` 互动相关逻辑）。路径前缀多为 `/api/v1/forum/*`，需登录。

## 核心模型

| 模型 | 说明 |
|------|------|
| ReactionRecord | 记录用户对帖子或评论的反应（Upvote / Downvote） |
| FavoriteRecord | 记录用户收藏的帖子（`PostFavoriteRecord`）或评论（`CommentFavoriteRecord`） |
| Counts | 帖子记录中包含 `upvotes`、`downvotes`、`comment_count`、`view_count` 等冗余字段，用于加速读取 |

## 反应流逻辑

### 点赞与点踩

- 原子性：计数更新与记录插入在同一数据库事务内完成。
- 互斥性：同一用户对同一内容只能有一种反应。用户已点 Upvote 时再点 Downvote，服务端取消原 Upvote 并记为 Downvote。
- 声望成本：点赞消耗 1、点踩消耗 2 点声望（`VoteCostUp/Down`），每日免费配额按等级递增（见 [声望与等级](./karma.md)）；撤销退款（`vote_cost_refund`）。
- 自动治理：反应变更会触发基于反馈的自动处置检查；阈值与触发条件为实现细节，见 [治理与规则](./governance.md)。

### 收藏系统

- 用户可以收藏帖子或评论，收藏列表通过 `/api/v1/forum/me/favorites/posts` 分块获取；评论收藏经 `/api/v1/forum/comments/{id}/favorites/toggle` 切换。
- 收藏操作不影响帖子的热度分计算。

## 统计数据维护

### 浏览计数

为防止刷量，浏览计数采用延迟更新或 API 层原子自增策略（以实现为准）。

### 评论计数

新评论创建并通过审核后，服务端累加对应帖子的 `comment_count`。

## 缓存同步

用户的反应状态（「我是否点过赞」）通常不缓存；高并发下帖子的汇总计数会同步到缓存，以支撑热门榜单渲染。缓存键与失效策略为实现细节。

## 相关

- [论坛模块](./index.md)
- [治理与规则](./governance.md)
- [内容与搜索](./content.md)
