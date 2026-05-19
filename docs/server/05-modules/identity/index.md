# 身份认证模块
---
slug: /server/05-modules/identity/
---

身份认证模块（原 SSO 项目）是 Luotopia 生态系统的核心，提供基于 OIDC 协议的统一身份管理。

## 1. 详细子文档
- **[OIDC 协议实现](oidc.md)**: 授权码流、令牌发放及客户端管理。
- **[武汉大学强认证 (HAM)](whu_auth.md)**: 针对武大校内的身份集成与 HAM Gateway 对接。
- **[账户与配置文件](profile.md)**: 用户注册、资料管理及开发者设置。
- **[安全与防御](security.md)**: 签名校验、Turnstile 集成及 Token 加密。
- **[租户与三方登录](tenant.md)**: 多租户隔离及第三方社交账号接入。

## 2. 目录结构
```text
internal/identity/
├── http/      # HTTP 接口实现 (account.go, oidc.go 等)
├── model/     # 数据模型 (models.go)
├── repo/      # 存储层 (database.go, redis.go)
└── service/   # 核心逻辑 (oidc.go, tokens.go, tenant.go 等)
```

## 3. 设计哲学
- **标准驱动**: 严格遵循 OpenID Connect 1.0 规范，确保与其他系统的互操作性。
- **租户隔离**: 支持多租户架构，不同租户拥有独立的配置、客户端和用户空间。
- **安全第一**: 核心敏感操作（如密钥生成、Token 签名）均在受保护的 Service 层完成。
