# 安全策略与合规

Luotopia Server 的安全设计旨在保护用户隐私并防御常见的网络攻击。

## 1. 认证机制

### 1.1 JWT 令牌

- **签署算法**: 默认使用 HS256，密钥通过 `config.json` 中的 `jwt_secret` 配置。
- **载荷 (Claims)**: 包含 `user_id`, `username`, `role`, `is_admin` 以及标准的 `exp` (过期时间)。
- **认证方式**: 客户端需在请求头中携带 `Authorization: Bearer <token>`。

### 1.2 SSO (OIDC)

- 遵循 OpenID Connect 标准。
- 支持授权码流 (Authorization Code Flow)。
- 关键状态（`state`, `nonce`）存储在数据库中并设有短有效期，防御 CSRF 和重放攻击。

### 1.3 API Key

- 为外部集成和开发者提供 `API Key` + `API Secret` 认证。
- API Secret 不在网络中传输，而是用于计算签名。

## 2. 授权机制

### 2.1 RBAC 权限模型

系统内置了以下角色层级：

1. **Anonymous**: 只能访问公开的课程列表、搜索预览。
2. **User**: 注册用户，可发表评论、发帖、管理个人资料。
3. **Admin**: 管理员，可审核内容、管理用户状态。
4. **SuperAdmin**: 超级管理员，可修改系统配置、分配角色权限。

### 2.2 路由保护

在 Huma 路由注册时，通过 `Security` 字段声明所需的认证方式。
在 Gin 中间件中，`AuthMiddleware` 和 `AdminAuthMiddleware` 负责检查权限。

## 3. 安全防御措施

### 3.1 速率限制

- 基于 Redis 实现令牌桶或固定窗口算法。
- 支持按 IP、按 User、按 API Key 进行多级限流。

### 3.2 人机校验 (CAPTCHA)

- 集成 Cloudflare Turnstile。
- 在 `/api/v1/register`, `/api/v1/login` 等关键端点强制校验。

### 3.3 数据加密与脱敏

- **密码**: 使用 `bcrypt` 进行高强度哈希。
- **敏感词过滤**: 论坛及评价模块集成了 AI 内容审核及敏感词过滤引擎。
- **日志脱敏**: `AdminLog` 在记录详细变更时会过滤掉密码等敏感字段。

## 4. 漏洞反馈

如发现安全漏洞，请通过 `security@whu.sb` 联系安全团队。
