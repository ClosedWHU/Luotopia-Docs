---
title: API 使用指南
sidebar_label: API 使用指南
description: Base URL、JWT 认证、OpenAPI 与限流
sidebar_position: 1
---
# API 使用指南

REST + [Huma v2](https://huma.rocks/)。**完整路径与字段以 OpenAPI 为准**。

## 基础

| 项 | 值 |
|----|-----|
| 前缀 | `/api/v1` |
| 格式 | `application/json` |
| 端口 | 配置 `server.port`（Docker 样例 **6262**） |
| 健康检查 | `GET /health` |

## 认证

实现：`internal/middleware/huma_auth.go`。`/api/v1/*` **默认要登录**；白名单见 [安全策略](../architecture/security_policy.md)。

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
- 权限窄，多为部分只读 GET  

### Web / OIDC

会话 Cookie + 授权码流（identity 模块）。

全站请求 HMAC 的迁移说明见 [已移除与迁移](../meta/removed-and-migrated.md#全站请求-hmac)。

## 文档与调试

服务起来后（端口换成你的配置）：

```text
http://localhost:6262/docs          # 交互文档（路径以实例为准）
http://localhost:6262/openapi.json  # 或仓库导出的 openapi.json
```

## 限流

`security.rate_limit` / `rate_window`。登录等路径另有尝试次数限制。

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

- [安全策略](../architecture/security_policy.md)
- [业务调用摘要](./detailed_reference.md)
- [客户端对接](pathname:///client/api_integration)
