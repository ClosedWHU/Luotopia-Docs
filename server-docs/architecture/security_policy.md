---
sidebar_position: 3
title: 安全策略
sidebar_label: 安全策略
slug: security-policy
---
# 安全策略

> **一句话**：HTTPS + Bearer JWT（或会话 / 用户 API 凭证）+ 服务端鉴权与限流。  
> **不做**：全站请求 HMAC / `X-Api-Sign`。  
> 实现：`internal/middleware/huma_auth.go`。

## 1. 认证机制

### 1.1 JWT 令牌（主路径）

- **签署算法**: HS256，密钥为 `security.jwt_secret`。
- **载荷 (Claims)**: 含用户 ID、用户名、角色、是否管理员、可选 `session_id`，以及标准 `exp`。
- **使用方式**: `Authorization: Bearer <access_token>`。
- **会话绑定**: 若 JWT 含 `session_id`，服务端会校验会话是否仍有效；吊销会话后 token 立即失效。

### 1.2 OIDC / SSO 会话

- 遵循 OpenID Connect；Web 端可通过会话 Cookie 认证。
- 关键状态（`state` / `nonce`）短有效期，降低 CSRF 与重放风险。

### 1.3 用户 API 凭证（集成用）

- 用户可创建自己的 `API Key` + `API Secret`（个人开发者/脚本集成）。
- **用法**: 请求头同时携带 `X-Api-Key` 与 `X-Api-Secret`（明文比对/哈希校验凭证本身）。
- **不是** 全站共享的请求 HMAC 签名；也**不**对 body 做 `X-Api-Sign`。
- 权限较窄：默认仅允许部分只读 GET（如 courses / teachers / reviews / search / random）。

### 1.4 匿名接口白名单

`/api/v1/*` **默认需要认证**。仅下列操作允许匿名（见 `anonymousOperations`）：

- 注册、登录、token 刷新
- 邮箱验证、密码重置、MFA、Passkey 登录相关
- 验证码配置 / Altcha 挑战
- 论坛 health

其它 `/api/v1` 路径未认证返回 401。

## 2. 授权机制

### 2.1 角色

1. **Anonymous**: 仅白名单接口（登录注册等），不能访问受保护业务写接口。
2. **User**: 登录用户，评价、资料、需登录的业务能力。
3. **Admin**: 管理后台（`/api/v1/admin/*`）。
4. **SuperAdmin**: 更敏感的管理操作（用户、队列、缓存、embedding 等）。

### 2.2 路由保护

- Huma 操作通过 `Security` 声明；运行时由 `NewHumaAuthMiddleware` + `enforceOperationAuthorization` 强制执行。
- 传输层安全依赖 **HTTPS**（生产 `server.public_base` 应为 `https://`）。

## 3. 安全防御措施

### 3.1 速率限制

- 全局限流：`security.rate_limit` / `rate_window`。
- 登录等敏感路径另有尝试次数窗口（identity OIDC 配置）。

### 3.2 人机校验

- Altcha / Turnstile 等保护注册、登录、重置密码等高成本匿名接口。
- 路径以代码中间件白名单为准（如 `POST /api/v1/user/login`）。

### 3.3 数据保护

- 密码 bcrypt 哈希。
- 用户 API Secret 优先存哈希。
- 日志与管理审计避免输出密码、token 等敏感字段。

### 3.4 Metrics 暴露

- Prometheus `/metrics` **默认不在业务 API 端口公开**。
- 独立监听：`monitoring.metrics_host` + `metrics_port`（默认 `127.0.0.1:9090`）。
- 可选 Basic Auth；仅当 `expose_metrics_on_api=true` 时才挂到主 API。

## 4. 当前请求安全模型

前后端通信安全建立在：

1. **TLS（HTTPS）** 保护信道完整性与机密性  
2. **用户级 JWT / Session / API 凭证** 证明身份  
3. **服务端授权与限流**  

全站 HMAC 的迁移说明见 [已移除与迁移](../meta/removed-and-migrated.md#全站请求-hmac)。

## 5. 漏洞反馈

如发现安全漏洞，请通过项目仓库 Security 渠道或维护者联系方式报告。

## 6. FAQ

**Q: 以前的签名示例为什么不能用？**  
A: 见 [已移除与迁移](../meta/removed-and-migrated.md#全站请求-hmac)；当前使用 Bearer JWT，或用户级 `X-Api-Key` + `X-Api-Secret`。

**Q: JWT 密钥泄露后怎么办？**  
A: 立即轮换 `security.jwt_secret`，并视情况吊销会话；已签发的 access token 在旧密钥下仍可能有效至过期，应配合短 TTL 与会话绑定。

**Q: 不需要登录的接口是不是不安全？**  
A: 白名单内的认证相关接口必须匿名才能完成登录流；它们靠验证码、限流与 HTTPS 防护，而不是 JWT。业务写接口仍默认要登录。

---
[返回目录](../index.md)
