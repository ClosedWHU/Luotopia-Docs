---
title: 云控接口参考
sidebar_label: 云控
sidebar_position: 21
description: 云控相关端点索引（字段与完整路径以 OpenAPI 为准）
slug: cloud-control
---

> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [云控模块](../modules/cloudcontrol.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/cloud-control/config` | Get resolved cloud control values for the caller |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
