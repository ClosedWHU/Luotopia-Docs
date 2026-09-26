---
title: 系统与公共接口接口参考
sidebar_label: 系统
sidebar_position: 20
description: 系统与公共接口相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [系统与公共接口模块](../modules/system.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/system/config` | Get remote configurations |
| `GET` | `/api/v1/system/password-policy` | Get the local-password policy for client-side validation |
| `GET` | `/api/v1/system/update` | Check for app updates |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
