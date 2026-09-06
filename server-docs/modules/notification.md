---
title: 站内通知
sidebar_label: 站内通知
sidebar_position: 12
---

代码：`internal/domains/components/notification`。

## 当前能力（以 handler 为准）

应用内通知 REST 示例：

| 方法 | 路径 |
|------|------|
| GET | `/api/v1/notifications` |
| GET | `/api/v1/notifications/unread-count` |
| POST | `/api/v1/notifications/{id}/read` |
| POST | `/api/v1/notifications/mark-all-read` |
| DELETE | `/api/v1/notifications/{id}` |

均需登录（Bearer）。字段与分页以 OpenAPI 为准（OperationID 为 kebab，如 `notification-list`）。

## 非当前保证

- **不**默认集成 FCM/APNs 推送通道（若代码未接入，勿在客户端假设有）  
- **无**独立 chat 模块的私聊转发  
- 设备 token 注册见 identity 的 `POST /api/v1/devices/register`（与本模块列表接口分离）

## 边界

业务侧写入通知记录 + 客户端拉取；推送渠道若后续增加，应在 worker / 第三方适配层实现并更新本文。

---
[返回模块总览](./index.md)
