---
title: 统一搜索接口参考
sidebar_label: 统一搜索
sidebar_position: 18
description: 统一搜索相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [统一搜索模块](../modules/search/index.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/v1/search/advanced` | Advanced search |
| `GET` | `/api/v1/search/courses` | Search courses |
| `GET` | `/api/v1/search/hot` | Get hot searches |
| `GET` | `/api/v1/search/reviews` | Search reviews |
| `GET` | `/api/v1/search/simple` | Simple search |
| `GET` | `/api/v1/search/teachers` | Search teachers |
| `GET` | `/api/v1/suggest/courses` | Suggest courses |
| `GET` | `/api/v1/suggest/reviews` | Suggest reviews |
| `GET` | `/api/v1/suggest/teachers` | Suggest teachers |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
