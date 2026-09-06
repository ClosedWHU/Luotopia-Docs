---
title: 安全与防御策略
sidebar_label: 安全与防御
sidebar_position: 4
---

Identity 模块集成多重机制，确保用户与令牌安全。以代码实现为准。

## 认证安全

- **JWT**：业务 access token 使用 HS256（`security.jwt_secret`）。可选绑定 `session_id`，吊销会话即失效。
- **OIDC**：身份提供方可使用配置的签名密钥；具体算法与 JWKS 以 identity 配置与实现为准。
- **速率限制**：登录尝试有窗口与次数限制（OIDC `loginAttemptLimit` / `loginAttemptWindow` 等配置项；数值以部署为准）。

## 交互安全

- **Altcha / 验证码**：注册、登录、重置密码等匿名高成本接口可强制人机校验。
- **无全站请求 HMAC**：移动端不再使用基于全局 `api_secret` 的请求签名；身份依赖 HTTPS + Bearer JWT（或用户级 API 凭证）。

## 敏感数据

- 密码 bcrypt 单向哈希。
- 用户 API Secret 优先哈希存储。
- API 与日志避免回传密码、完整 token、隐私字段。

## MFA 与 Passkey

SMTP、OTP 与 WebAuthn 域名关联见 [MFA 与 Passkey](./mfa_passkeys.md)。

## 相关

- [身份认证模块](./index.md)
- [安全策略](../../architecture/security_policy.md)
- [账号注销策略](./account_deletion.md)
