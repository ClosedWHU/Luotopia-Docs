---
title: AI 助手接口参考
sidebar_label: AI 助手
sidebar_position: 22
description: AI 助手相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [AI 助手模块](../modules/agent.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/v1/agent/chat` | Chat with Luotopia agent |
| `GET` | `/api/v1/agent/tools` | List available Luotopia agent tools |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
