---
title: 论坛接口参考
sidebar_label: 论坛
sidebar_position: 11
description: 论坛相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> [!NOTE]
> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [论坛模块](../modules/forum/index.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/forum/admin/alumni/verifications` | Admin list alumni verifications |
| `POST` | `/api/v1/forum/admin/alumni/verifications/{id}/review` | Admin review alumni verification |
| `GET` | `/api/v1/forum/admin/appeals` | Admin list appeals |
| `POST` | `/api/v1/forum/admin/appeals/{id}/resolve` | Admin resolve appeal |
| `GET` | `/api/v1/forum/admin/comments` | Admin list comments by author |
| `GET` | `/api/v1/forum/admin/config-changes` | Admin config change log |
| `GET` | `/api/v1/forum/admin/moderation` | Admin moderation queue |
| `GET` | `/api/v1/forum/admin/posts` | Admin list posts |
| `GET` | `/api/v1/forum/admin/posts/{id}` | Admin get post evidence |
| `POST` | `/api/v1/forum/admin/posts/{id}/moderate` | Admin moderate post |
| `POST` | `/api/v1/forum/admin/reports/{id}/claim` | Admin claim or release report |
| `POST` | `/api/v1/forum/admin/reports/{id}/resolve` | Admin resolve report |
| `POST` | `/api/v1/forum/admin/users/{id}/karma` | Admin adjust user karma |
| `POST` | `/api/v1/forum/admin/users/{id}/status` | Admin mute, ban, unmute, or unban a user |
| `POST` | `/api/v1/forum/alumni/verifications` | Submit alumni verification |
| `GET` | `/api/v1/forum/alumni/verifications/me` | My alumni verification |
| `GET` | `/api/v1/forum/appeals` | List my appeals |
| `POST` | `/api/v1/forum/appeals` | Create appeal |
| `POST` | `/api/v1/forum/attachments` | Upload attachment |
| `DELETE` | `/api/v1/forum/attachments/{id}` | Delete attachment |
| `GET` | `/api/v1/forum/attachments/{id}` | Get attachment |
| `POST` | `/api/v1/forum/attachments/claim` | Claim attachment |
| `GET` | `/api/v1/forum/boards` | List boards |
| `POST` | `/api/v1/forum/boards` | Create board |
| `DELETE` | `/api/v1/forum/boards/{id}` | Delete board |
| `PATCH` | `/api/v1/forum/boards/{id}` | Update board |
| `GET` | `/api/v1/forum/boards/{id}/posts` | List board posts |
| `GET` | `/api/v1/forum/boards/{id}/tags` | List board tags |
| `GET` | `/api/v1/forum/bootstrap` | Forum client bootstrap |
| `DELETE` | `/api/v1/forum/comments/{id}` | Delete comment |
| `POST` | `/api/v1/forum/comments/{id}/favorites/toggle` | Toggle comment favorite |
| `POST` | `/api/v1/forum/comments/{id}/reactions` | React to comment |
| `GET` | `/api/v1/forum/drafts` | List my drafts |
| `POST` | `/api/v1/forum/drafts` | Create or update a draft |
| `DELETE` | `/api/v1/forum/drafts/{id}` | Delete a draft |
| `GET` | `/api/v1/forum/drafts/{id}` | Get one of my drafts |
| `POST` | `/api/v1/forum/drafts/{id}/publish` | Publish a draft |
| `GET` | `/api/v1/forum/feed` | Forum feed |
| `GET` | `/api/v1/forum/health` | Forum service health |
| `POST` | `/api/v1/forum/invites/generate` | Generate invite |
| `GET` | `/api/v1/forum/leaderboard` | Public leaderboard |
| `POST` | `/api/v1/forum/me/checkin` | Daily check-in |
| `GET` | `/api/v1/forum/me/favorites/posts` | My favorite posts |
| `GET` | `/api/v1/forum/me/karma` | My karma |
| `GET` | `/api/v1/forum/me/karma/ledger` | My karma ledger |
| `PATCH` | `/api/v1/forum/me/karma/privacy` | Update karma privacy |
| `DELETE` | `/api/v1/forum/me/leaderboard` | Leave leaderboard |
| `GET` | `/api/v1/forum/me/leaderboard` | My leaderboard membership |
| `PATCH` | `/api/v1/forum/me/leaderboard` | Update leaderboard profile |
| `POST` | `/api/v1/forum/me/leaderboard/join` | Join leaderboard |
| `GET` | `/api/v1/forum/me/posts` | My posts |
| `PATCH` | `/api/v1/forum/me/profile` | Update my forum profile and privacy flags |
| `GET` | `/api/v1/forum/me/reactions/posts` | My reacted posts |
| `GET` | `/api/v1/forum/notifications` | Forum notifications |
| `POST` | `/api/v1/forum/notifications/read` | Mark forum notifications read |
| `POST` | `/api/v1/forum/posts` | Create post |
| `DELETE` | `/api/v1/forum/posts/{id}` | Delete post |
| `GET` | `/api/v1/forum/posts/{id}` | Get post |
| `PATCH` | `/api/v1/forum/posts/{id}` | Update post |
| `GET` | `/api/v1/forum/posts/{id}/comments` | List post comments |
| `POST` | `/api/v1/forum/posts/{id}/comments` | Create comment |
| `POST` | `/api/v1/forum/posts/{id}/favorites/toggle` | Toggle post favorite |
| `POST` | `/api/v1/forum/posts/{id}/reactions` | React to post |
| `GET` | `/api/v1/forum/posts/search` | Search posts |
| `GET` | `/api/v1/forum/public-admin-logs` | Public admin logs |
| `POST` | `/api/v1/forum/reports` | Create report |
| `GET` | `/api/v1/forum/settings` | Get forum settings |
| `PATCH` | `/api/v1/forum/settings` | Update forum settings |
| `GET` | `/api/v1/forum/tags` | List tags |
| `POST` | `/api/v1/forum/tags` | Create tag |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
