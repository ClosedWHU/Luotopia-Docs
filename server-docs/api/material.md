---
title: 学习资料接口参考
sidebar_label: 学习资料
sidebar_position: 17
description: 学习资料相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [学习资料模块](../modules/materials.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/materials` | Search for learning materials |
| `GET` | `/api/v1/materials/{material_uid}/download` | Download a learning material |
| `GET` | `/api/v1/materials/{material_uid}/preview` | Preview a material uploaded by the current user |
| `POST` | `/api/v1/materials/upload` | Upload a learning material |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
