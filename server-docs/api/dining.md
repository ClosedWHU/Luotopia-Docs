---
title: 食堂接口参考
sidebar_label: 食堂
sidebar_position: 15
description: 食堂相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [食堂模块](../modules/dining.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/dining/admin/areas` | List all Dining areas including inactive records |
| `POST` | `/api/v1/dining/admin/areas` | Create dining record |
| `PATCH` | `/api/v1/dining/admin/areas/{id}` | Update dining area |
| `POST` | `/api/v1/dining/admin/areas/sync-tencent` | Tencent dining synchronization |
| `POST` | `/api/v1/dining/admin/buildings` | Create dining record |
| `PATCH` | `/api/v1/dining/admin/buildings/{id}` | Update Dining catalog record |
| `POST` | `/api/v1/dining/admin/buildings/{id}/merge` | Merge dining buildings |
| `POST` | `/api/v1/dining/admin/floors` | Create dining record |
| `PATCH` | `/api/v1/dining/admin/floors/{id}` | Update Dining catalog record |
| `PUT` | `/api/v1/dining/admin/floors/{id}/plan` | Update floor plan |
| `POST` | `/api/v1/dining/admin/menu-groups` | Create dining record |
| `PATCH` | `/api/v1/dining/admin/menu-groups/{id}` | Update Dining catalog record |
| `POST` | `/api/v1/dining/admin/menu-items` | Create dining record |
| `PATCH` | `/api/v1/dining/admin/menu-items/{id}` | Update Dining catalog record |
| `GET` | `/api/v1/dining/admin/quality` | List dining quality issues |
| `GET` | `/api/v1/dining/admin/reports` | List dining reports |
| `PATCH` | `/api/v1/dining/admin/reports/{id}` | Moderate dining report |
| `PATCH` | `/api/v1/dining/admin/reviews/{id}` | Moderate dining review |
| `PUT` | `/api/v1/dining/admin/reward-policy` | Configure Dining contribution rewards |
| `POST` | `/api/v1/dining/admin/spot-aliases` | Create dining record |
| `GET` | `/api/v1/dining/admin/spot-bans` | List active recommendation bans |
| `POST` | `/api/v1/dining/admin/spot-bans` | Create dining record |
| `DELETE` | `/api/v1/dining/admin/spot-bans/{id}` | Delete recommendation ban |
| `POST` | `/api/v1/dining/admin/spots` | Create dining record |
| `PATCH` | `/api/v1/dining/admin/spots/{id}` | Update Dining catalog record |
| `PUT` | `/api/v1/dining/admin/spots/{id}/business-hours` | Replace business hours |
| `POST` | `/api/v1/dining/admin/spots/{id}/merge` | Merge dining spots |
| `PUT` | `/api/v1/dining/admin/spots/{id}/schedule-exceptions` | Replace schedule exceptions |
| `GET` | `/api/v1/dining/admin/submissions` | List dining submissions |
| `PATCH` | `/api/v1/dining/admin/submissions/{id}` | Moderate dining submission |
| `POST` | `/api/v1/dining/admin/submissions/{id}/revoke` | Revoke invalid Dining contribution reward |
| `GET` | `/api/v1/dining/areas` | List dining areas |
| `GET` | `/api/v1/dining/buildings` | List dining buildings |
| `GET` | `/api/v1/dining/buildings/{id}/floors` | List building floors |
| `GET` | `/api/v1/dining/floors/{id}/plan` | Get floor plan |
| `DELETE` | `/api/v1/dining/menu-comments/{id}` | Delete own menu comment |
| `POST` | `/api/v1/dining/menu-items/{id}/comment` | Create menu item comment |
| `GET` | `/api/v1/dining/menu-items/{id}/comments` | List menu item comments |
| `POST` | `/api/v1/dining/menu-items/{id}/reaction` | React to menu item |
| `GET` | `/api/v1/dining/recommendation-snapshot` | Get recommendation snapshot |
| `GET` | `/api/v1/dining/recommendations` | Recommend spots |
| `POST` | `/api/v1/dining/reviews/{id}/reaction` | React to review |
| `POST` | `/api/v1/dining/reviews/{id}/report` | Report review |
| `GET` | `/api/v1/dining/reward-policy` | Dining contribution reward rules |
| `GET` | `/api/v1/dining/search` | Search dining |
| `GET` | `/api/v1/dining/snapshot` | Get dining snapshot |
| `GET` | `/api/v1/dining/spots` | List dining spots |
| `GET` | `/api/v1/dining/spots/{id}` | Get dining spot |
| `GET` | `/api/v1/dining/spots/{id}/aliases` | List dining spot aliases |
| `GET` | `/api/v1/dining/spots/{id}/business-hours` | Get business hours |
| `GET` | `/api/v1/dining/spots/{id}/menu` | List menu items |
| `GET` | `/api/v1/dining/spots/{id}/menu-groups` | List menu groups |
| `DELETE` | `/api/v1/dining/spots/{id}/review` | Delete own review |
| `POST` | `/api/v1/dining/spots/{id}/review` | Create or update review |
| `GET` | `/api/v1/dining/spots/{id}/reviews` | List reviews |
| `GET` | `/api/v1/dining/spots/{id}/schedule-exceptions` | List schedule exceptions |
| `GET` | `/api/v1/dining/spots/random` | Choose a random spot |
| `POST` | `/api/v1/dining/submissions` | Submit dining data |
| `DELETE` | `/api/v1/dining/submissions/{id}` | Cancel pending dining submission |
| `GET` | `/api/v1/dining/submissions/mine` | List my dining submissions |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
