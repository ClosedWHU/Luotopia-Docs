---
title: 身份认证模块
sidebar_label: 概览
sidebar_position: 0
---

代码：`internal/domains/identity`。身份认证域提供基于 OIDC 协议的统一身份管理：注册登录、会话、社交登录（Ham）与用户 API 凭证。

## 子文档

- **[OIDC 协议实现](oidc.md)**：授权码流、令牌
- **[Ham 与教务 CAS](whu_auth.md)**：社交登录与 App 教务会话边界
- **[账户与资料](profile.md)**
- **[安全与防御策略](security.md)**：JWT、Altcha、无全站 HMAC
- **[MFA 与 Passkey](mfa_passkeys.md)**：SMTP、OTP、域名关联
- **[租户与社交登录](tenant.md)**
- **[账号注销策略](account_deletion.md)**
- **[隐私同意、设备与云同步](privacy_sync.md)**

## 目录结构

```text
internal/domains/identity/
├── http/
├── model/
├── repo/
└── service/
```

## 设计要点

- OIDC / 会话 / 业务 JWT 分工清晰
- 武大教务会话不落服务端
- 用户 API 凭证（Key + Secret）仅作集成，非请求签名

## 相关

- [模块详解](../index.md)
- [安全策略](../../architecture/security_policy.md)
- [API 使用指南](../../api/overview.md)
