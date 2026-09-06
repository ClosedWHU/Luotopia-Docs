---
title: API 使用指南
sidebar_label: API 使用指南
description: Base URL、JWT 认证、OpenAPI 与限流
sidebar_position: 1
---

REST + [Huma v2](https://huma.rocks/)。**完整路径与字段以 OpenAPI 为准**。

业务路由统一经 `httpapi.Register` 注册（Access + 可选限流）。见 [HTTP 注册规范](./http_api.md)。

## 基础

| 项 | 值 |
|----|-----|
| 前缀 | `/api/v1` |
| 格式 | `application/json`（失败多为 `application/problem+json`） |
| 端口 | 配置 `server.port`（Docker 样例 **6262**） |
| 健康检查 | `GET /health`、就绪 `GET /ready` |

## 认证

实现：`internal/middleware/huma_auth.go` + Access 注册表。`/api/v1/*` **默认要登录**；公开接口以 `AccessPublic` 声明为准，见 [安全策略](../architecture/security_policy.md)。

### JWT（App 主路径）

```http
Authorization: Bearer <access_token>
```

- 登录：`POST /api/v1/user/login`（及 MFA / Passkey 等）
- 刷新：`POST /api/v1/user/token/refresh`

### 用户 API 凭证（脚本）

```http
X-Api-Key: <key>
X-Api-Secret: <secret>
```

- 用户在账号里创建的个人凭证  
- **不是**对 body 的 HMAC；**不是**全站 `api_secret`  
- 权限窄，多为部分只读 GET；另有凭证级配额  

### Web / OIDC

会话 Cookie + 授权码流（identity 模块）。

## 文档与调试

服务起来后（端口换成你的配置）：

```text
http://localhost:6262/docs          # 交互文档（路径以实例为准）
http://localhost:6262/openapi.json  # 或仓库导出的 openapi.json
```

## 限流

- 默认：未单独配置时，API 按 IP 约 50 次/分钟。
- 敏感操作可声明多层窗口（分钟/小时/天）与主体（IP / 用户）。
- 配置项与实现见 `security` 配置、Redis 限流与 [HTTP 注册规范](./http_api.md#4-限流)。
- 登录等路径另有 identity 侧尝试次数限制。

## 不在本 API 的客户端能力

下列由 **官网 homepage** 或 **App 直连第三方** 提供，不要在 OpenAPI 里找主路径：

| 能力 | 来源 |
|------|------|
| 安装包检查更新 | `GET https://www.whu.sb/api/releases/latest` |
| 热更新脚本 | `https://www.whu.sb/hot-update/` |
| 天气 | 第三方 API（AccuWeather / Open-Meteo / 小米等） |
| 法律文档 / 友情链接 JSON | 官网静态资源 |

见 [system 模块](../modules/system.md)、[校园边界](../modules/campus_proxies.md)、[客户端 · 更新](pathname:///client/updates)。

## 相关

- [HTTP 注册规范](./http_api.md)
- [安全策略](../architecture/security_policy.md)
- [业务调用摘要](./detailed_reference.md)
- [已移除与迁移](../meta/removed_and_migrated.md)（旧协议 / 旧注册方式）
- [客户端对接](pathname:///client/api-integration)
