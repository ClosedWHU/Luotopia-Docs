---
title: 论坛互动
sidebar_label: 互动系统
sidebar_position: 3
---


代码：`internal/domains/forum`（`repo` 互动相关逻辑）。路径前缀多为 `/api/v1/forum/*`，需登录。

## 1. 核心模型
- **ReactionRecord**: 记录用户对帖子或评论的反应（Upvote/Downvote）。
- **FavoriteRecord**: 记录用户收藏的帖子。
- **Counts**: 帖子 Record 中包含 `upvotes`, `downvotes`, `comment_count`, `view_count` 等冗余字段，用于加速读取。

## 2. 反应流逻辑 (`interaction.go`)
### 2.1 点赞与点踩（`ToggleReaction`）

- **原子性**: 使用数据库事务确保计数更新与记录插入的一致性。
- **互斥性**: 同一个用户对同一个内容只能有一种反应。如果当前是 Upvote 状态下点击 Downvote，系统会自动取消 Upvote 并转为 Downvote。
- **触发机制**: 
    - 每次反应变更都会重新触发 `applyModerationThresholds`，检查是否触发自动隐藏逻辑。

### 2.2 收藏系统（`ToggleFavorite`）

- 用户可以收藏帖子，收藏列表通过 `/api/v1/forum/favorites` 接口分块获取。
- 收藏操作不影响帖子的热度分计算。

## 3. 统计数据维护
### 3.1 浏览计数
- 为了防止刷量，浏览计数目前采用基于 Session 的延迟更新策略，或在 API 层直接进行原子自增。

### 3.2 评论计数
- 当新评论创建且通过审核后，对应帖子的 `comment_count` 会自动加 1。

## 4. 缓存同步
- 用户的反应状态（“我是否点过赞”）通常不缓存，但在高并发下，帖子的汇总计数（Counts）会同步更新到 Redis 缓存中，以支撑热门榜单的快速渲染。
