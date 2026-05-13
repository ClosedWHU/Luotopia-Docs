# OIDC 协议实现

本模块实现了标准的 OpenID Connect 1.0 协议，支持第三方应用安全接入 Luotopia。

## 1. 授权流程 (`service/oidc_flow.go`)
系统主要支持 **Authorization Code Flow**：
1. **Authorize**: 客户端引导用户至 `/oidc/auth`，带上 `client_id`, `response_type=code`, `scope`, `state` 及 `nonce`。
2. **Consent**: 用户登录并确认授权范围。
3. **Token Exchange**: 客户端通过 `/oidc/token` 使用 `code` 交换 `access_token` 和 `id_token`。

## 2. 令牌管理 (`service/tokens.go`)
### 2.1 ID Token
- 包含用户的核心身份信息（`sub`, `email`, `name`）。
- 使用 RS256 算法签名，私钥存储在安全配置中，公钥通过 `.well-known/jwks.json` 公开。

### 2.2 Access Token
- 用于访问受保护的 API。
- 具有较短的有效期（默认 1 小时），支持通过 `refresh_token` 续期。

## 3. 客户端管理 (`service/oidc_apps.go`)
- **客户端类型**: 支持 `confidential` (有密钥) 和 `public` (无密钥，如移动端)。
- **重定向校验**: 严格校验 `redirect_uri`，防止授权码劫持。

## 4. 身份映射 (`service/oidc_identity.go`)
- 将内部 `models.User` 映射为标准的 OIDC Claims。
- 支持 `openid`, `profile`, `email`, `phone` 等标准 Scope。
