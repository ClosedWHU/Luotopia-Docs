---
title: 站内通知接口参考
sidebar_label: 站内通知
sidebar_position: 16
description: 站内通知相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> [!NOTE]
> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [站内通知模块](../modules/notification.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/notifications` | List user notifications |
| `DELETE` | `/api/v1/notifications/{id}` | Delete a notification |
| `PUT` | `/api/v1/notifications/{id}/read` | Mark notification as read |
| `PUT` | `/api/v1/notifications/mark-all-read` | Mark all notifications as read |
| `GET` | `/api/v1/notifications/unread-count` | Get unread notification count |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
