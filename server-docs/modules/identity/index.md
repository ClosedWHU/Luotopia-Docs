---
title: 身份认证模块
sidebar_label: 概览
sidebar_position: 0
---


身份认证模块（原 SSO 项目）是 Luotopia 生态系统的核心，提供基于 OIDC 协议的统一身份管理。

## 1. 详细子文档

- **[OIDC](oidc.md)**：授权码流、令牌
- **[HAM vs 教务 CAS](whu_auth.md)**：社交登录与 App 教务会话边界
- **[账户与资料](profile.md)**
- **[安全](security.md)**：JWT、Altcha、无限全站 HMAC
- **[MFA 与 Passkey](mfa_passkeys.md)**：SMTP、OTP、域名关联
- **[租户与社交登录](tenant.md)**

## 2. 目录结构

```text
internal/domains/identity/
├── http/
├── model/
├── repo/
└── service/
```

## 3. 设计要点

- OIDC / 会话 / 业务 JWT 分工清晰  
- 武大教务会话不落服务端  
- 用户 API 凭证（Key+Secret）仅作集成，非请求签名
