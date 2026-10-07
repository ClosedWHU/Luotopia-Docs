---
title: 社交与私信接口参考
sidebar_label: 社交与私信
sidebar_position: 14
description: 社交与私信相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> [!NOTE]
> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [社交与私信模块](../modules/social.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `DELETE` | `/api/v1/social/block/{id}` | Unblock a user |
| `POST` | `/api/v1/social/block/{id}` | Block a user |
| `GET` | `/api/v1/social/blocks` | List my blocked users |
| `GET` | `/api/v1/social/conversations` | List my conversations |
| `GET` | `/api/v1/social/conversations/{id}/messages` | List conversation messages |
| `DELETE` | `/api/v1/social/follow/{id}` | Unfollow a user |
| `POST` | `/api/v1/social/follow/{id}` | Follow a user |
| `DELETE` | `/api/v1/social/followers/{id}` | Remove a follower |
| `POST` | `/api/v1/social/messages/{id}` | Send a direct message |
| `POST` | `/api/v1/social/messages/read` | Mark messages read |
| `GET` | `/api/v1/social/messages/unread-count` | Get unread message count |
| `GET` | `/api/v1/social/relation/{id}` | Get relation state with a user |
| `GET` | `/api/v1/social/users/{id}` | Get public user profile |
| `GET` | `/api/v1/social/users/{id}/comments` | List a user's public comments |
| `GET` | `/api/v1/social/users/{id}/favorites` | List a user's favorite posts |
| `GET` | `/api/v1/social/users/{id}/followers` | List a user's followers |
| `GET` | `/api/v1/social/users/{id}/following` | List who a user follows |
| `GET` | `/api/v1/social/users/{id}/liked` | List a user's liked posts |
| `GET` | `/api/v1/social/users/{id}/posts` | List a user's public posts |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
