---
title: 租户与社交登录
sidebar_label: 租户与社交登录
sidebar_position: 5
---

# 租户与社交登录

## 1. 多租户

- 配置：`identity.tenancy`（如 `defaultTenantName` / `defaultTenantSlug`）
- 启用时创建/使用默认租户；细粒度隔离以模型与 service 为准

## 2. 社交登录

- 提供商列表：`identity.social.providers`（`ham`、通用 OAuth2/OIDC 等）
- 字段为 camelCase JSON（`clientId`、`authorizationEndpoint`…）
- **HAM** 是 Luotopia 账号社交源，不是教务 CAS 代爬（见 [whu_auth.md](./whu_auth.md)）

## 3. 勿混淆

| 能力 | 位置 |
|------|------|
| Luotopia 登录 / OIDC | 服务端 identity |
| 武大教务会话 | App `whu_auth` |

---
[返回](./index.md)
