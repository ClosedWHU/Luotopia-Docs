---
title: OIDC 协议实现
sidebar_label: OIDC
sidebar_position: 1
---

代码：`internal/domains/identity`（`service/oidc*.go`、`service/jwks.go`、`service/tokens.go`）。对外路由集中在 `http/user_routes.go`。**字段与完整路径以 OpenAPI 为准**。

本模块实现 OpenID Connect 发现、JWKS 与 UserInfo 端点，供第三方校验 Luotopia 签发的身份令牌；社交登录（如 Ham OAuth2）也由本服务编排（见 [租户与社交登录](./tenant.md)、[武大身份说明](./whu_auth.md)）。

## 对外端点（OIDC Tag）

对外暴露 OIDC 发现（`/.well-known/openid-configuration`）、JWKS（`/oidc/jwks`）、UserInfo（`/oidc/userinfo`）与 Passkey 关联（`/.well-known/assetlinks.json`、`apple-app-site-association`）。**完整端点见 [身份认证接口参考](../../api/identity.md)**。

> 业务 API 的 Bearer access token 与 OIDC ID Token 不是同一概念：业务 JWT 默认使用 `security.jwt_secret`（HS256），见 [安全策略](../../architecture/security_policy.md)。

## 令牌管理（`service/tokens.go`）

- **ID Token**：含用户核心声明（`sub`、`email`、`name` 等，以实际 claims 为准）；签名材料由 `identity.oidc` 配置提供（密钥只放环境 / 密钥管理，不进文档与 git）。
- **Access Token / Refresh**：业务 API 访问与刷新轮换；TTL 见配置（`identity.oidc.*`）。

## OAuth 应用与同意（service 级）

- `service/oidc_apps.go`：`RegisterOAuthApp`、`ListOAuthApps`（`oauth_applications` 表，`confidential` / `public` 客户端），**暂无对外 HTTP 路由**。
- `service/oidc_flow.go`：登录 / 同意跳转与授权码回调的编排逻辑、同意（consent）管理。
- `service/secret_migration.go`：OAuth 客户端密钥 bcrypt 迁移、历史社交 `ExternalIdentity.TokenSetJSON` 的 AES-GCM 加密迁移。

## 常见问题

**Q：为什么 ID Token 的签名验证失败？**

A：请确保使用从 `/oidc/jwks` 端点获取的最新公钥。密钥轮转后旧公钥失效。

## 相关

- [身份认证模块](./index.md)
- [安全与防御策略](./security.md)
- [安全策略](../../architecture/security_policy.md)
