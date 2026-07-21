---
title: 账户资料与个人信息
sidebar_label: 账户资料
sidebar_position: 3
---

# 账户与资料管理

代码：`internal/domains/identity`（http/user 等 handler）。

## 1. 注册与登录

- 用户名/邮箱 + 密码（匿名白名单路径，通常需验证码）
- 社交登录（如 HAM，配置 `identity.social.providers`）
- Passkey / MFA / 邮箱验证 / 密码重置（见 OpenAPI 与 `anonymousOperations`）
- 匿名游客登录不作为产品路径；迁移说明见 [已移除与迁移](../../meta/removed-and-migrated.md)。

## 2. 资料与安全

- 资料更新、改密、会话列表等需 Bearer
- 用户 **API 凭证**（Key + Secret）：集成脚本用，请求头直传，非 HMAC

## 3. 与教务的关系

绑定武大身份若存在，以 identity API 为准；**教务 Cookie 不在本模块代持**。

---
[返回](./index.md)
