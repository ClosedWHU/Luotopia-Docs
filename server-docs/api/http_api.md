---
title: HTTP API 注册与限流规范
slug: http-api
sidebar_label: HTTP 注册规范
description: httpapi.Register、Access、限流与错误契约
sidebar_position: 2
---

本文描述 Go 业务 API 的**当前**注册方式、鉴权声明与限流。字段级路径与 schema 仍以 **OpenAPI** 为准。

弃用写法、旧白名单、OperationID 重命名等见 **[已移除与迁移](../meta/removed_and_migrated.md#http-路由注册huma--httpapi)**。

权威实现：

- `server/internal/httpapi/`
- `server/internal/middleware/`（鉴权、限流中间件）
- `server/internal/platform/errors/`、`platform/cache/rate_limit.go`
- 仓库英文细则：`server/docs/api-conventions.md`

## 1. 请求栈

```text
Gin（request_id / 日志 / CORS / Altcha）
  → Huma（错误变换 → 鉴权 → 限流）
  → httpapi.Register 注册的 handler
```

- 基础设施：`GET /health`、`/ready`、metrics 仍走 Gin。
- 日历订阅：`GET /api/v1/calendar/export.ics` 仍走 Gin（便于订阅客户端）；失败体仍为 problem+json。JSON 日历 API 走 Huma/`httpapi`。

## 2. 注册方式

业务接口使用：

```go
httpapi.Register(api, httpapi.Op{
    ID:      "forum-create-post", // 全局唯一，小写 kebab
    Method:  http.MethodPost,
    Path:    "/api/v1/forum/posts",
    Summary: "Create post",
    Tags:    []string{"Forum"},
    Access:  httpapi.AccessUser,
    Rate: &httpapi.Rate{
        Scope:    "example-write-user",
        Subject:  httpapi.SubjectUser,
        Windows:  []cache.RateWindow{cache.MinuteWindow(<N>), cache.HourWindow(<M>)},
        Detail:   "too many forum write requests",
    },
}, h.PostPosts)
```

配额数值与降级策略以实现为准，不在公开文档中固定。

业务包不要直接调用 `huma.Register`（仅由 `httpapi.Register` 内部调用）。

| 字段 | 约定 |
|------|------|
| `ID` | `{domain}-{verb}-{object?}`，kebab-case |
| `Path` | 通常 `/api/v1/...`；OIDC/社交可有 `/auth/*`、`/oidc/*`、`/.well-known/*` |
| `Access` | 同时决定 OpenAPI `Security` 与运行时鉴权 |
| `Rate` | 省略则回落默认配额（以部署配置为准）；`Exempt: true` 不参与限流 |

### Access

| Access | 文档 Security | 运行时 |
|--------|---------------|--------|
| `Public` | 空要求 `{}` | 无需登录 |
| `User` | `bearerAuth` | JWT / Session /（部分路径）API Key |
| `Admin` | `bearerAuth` | admin 或 superadmin |
| `SuperAdmin` | `bearerAuth` | 仅 superadmin |

未在 Access 注册表中的 `/api/v1/*` 操作**默认需要认证**。公开能力使用 `AccessPublic`。

## 3. 错误契约

失败响应为 **problem+json**（扩展字段）：

| 字段 | 含义 |
|------|------|
| `status` | HTTP 状态 |
| `detail` | 可展示短文案（无 SQL/路径/stack） |
| `code` | 粗粒度错误类 |
| `business_code` | 客户端分支用稳定整数 |
| `request_id` | 请求追踪 |

Handler 出口：

```go
return nil, httpapi.Error(ctx, err)
// 或已结构化：
return nil, middleware.ToHumaError(ctx, appErrors.NotFoundf("..."))
```

未知错误映射为固定内部文案并写服务端日志，不向客户端透传 `err.Error()`。

`business_code` 分段见 [错误码](./error_codes.md) 与 `platform/errors`。

## 4. 限流

| 能力 | 说明 |
|------|------|
| 声明 | `httpapi.Op.Rate`（`Scope` / `Subject` / `Windows` 等字段以代码为准） |
| 默认 | 未声明 Rate 的 `/api/v1/*` 回落默认 IP 配额；配额与窗口机制以部署配置为准 |
| 豁免 | 基础设施与静态读路径可豁免限流，清单以实现为准 |
| 降级 | 限流依赖不可用时的降级策略以实现为准 |

典型声明：登录注册 IP 分层、头像 per-user 多层、论坛写/互动、Agent chat、资料上传等。

用户级 API 凭证另有 RPM/RPH/日/月配额（与操作限流叠加）。

## 5. DTO 与分页

- 输入：path/query/header/body + Huma 校验 tag。
- 输出：`type XxxOutput struct { Body ... }`；JSON **snake_case**。
- 可选分页骨架：`httpapi.PageQuery` / `PageBody`（`limit` + `cursor`）。

## 6. 模块覆盖

identity、verification、system、agent、notification、campus（Huma）、dining、search、materials、course_review、admin、forum、platform cache 均经 `httpapi` 注册。通知等 OperationID 命名见 OpenAPI。

## 相关

- [API 使用指南](./overview.md)
- [安全策略](../architecture/security_policy.md)
- [错误码](./error_codes.md)
- [已移除与迁移](../meta/removed_and_migrated.md)
