---
title: 站内通知
sidebar_label: 站内通知
sidebar_position: 12
---

代码：`internal/domains/notification`（`http`、`model`、`push`、`repo`、`service`）。**字段与分页以 OpenAPI 为准**。

## 站内通知 REST

站内通知列表 / 未读数 / 已读 / 全部已读 / 删除，均需登录（Bearer），OperationID 为 kebab（如 `notification-list`、`notification-mark-read`）。完整端点见[站内通知接口参考](../api/notification.md)。

## 推送通道（push）

通知域含 `push/` 子包，实现 FCM 与 HMS（华为）推送：

- Provider：`fcm`（Firebase Admin SDK）与 `hms`（Huawei Push Kit）；iOS 经 FCM 的 APNs payload 送达，无独立 APNs provider。
- 投递经 outbox（`notification_push_deliveries`）与 Dispatcher，在 worker 中启动（`cmd/worker/main.go`）。
- 入队前校验 `push.fcm.enabled` / `push.hms.enabled` 与用户推送同意（如论坛 `ConsentPushForum`）。
- 配置：`push.fcm.*`、`push.hms.*`（见 [配置手册](../deployment/config.md)）。

设备 token 注册在 identity：`POST /api/v1/devices/register`（需登录），设备携带 `push_provider`（`fcm` / `hms`）。

## 边界

业务侧写入通知记录 + 客户端拉取（REST）；推送由 worker 侧投递。私信（一对一会话）属于 [社交与私信](./social.md) 的 `social` 域，不在本模块转发。

## 相关

- [模块详解](./index.md)
- [站内通知接口参考](../api/notification.md)
- [隐私同意、设备与云同步](./identity/privacy_sync.md)
- [论坛运营工具](./forum/operations.md)
