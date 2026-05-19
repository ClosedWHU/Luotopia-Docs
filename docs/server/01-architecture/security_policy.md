---
title: 安全策略
slug: security-policy
---

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

## 5. API 签名与完整性保护 (API Signature & Integrity)
 
为了防御重放攻击及中间人篡改，Luotopia 在开放平台端点强制执行 API 签名校验机制。
 
### 5.1 签名基串 (Signature Base) 构造规范
签名基串按以下逻辑进行拼接，确保请求内容的不可篡改性：
`HTTP_Method + Canonical_Path + Request_Body + Timestamp + Api_Key`
 
- **时间戳约束**: 采用秒级 Unix 时间戳，系统容差范围为 ±300 秒，超过该范围的请求将被判定为失效。
- **参数归一化**: 拼接路径时需剔除动态随机参数（如 `_t`），确保基串的唯一性。
 
### 5.2 密钥衍生逻辑 (Key Derivation)
为了增强安全性，系统并不直接使用原始 `API_Secret`，而是通过派生函数生成 HMAC 密钥：
1.  **反转 (Reverse)**: 反转原始密钥字符串。
2.  **修剪 (Trim)**: 移除反转后字符串的首位与末位字符。
 
这种“简单混淆”策略能在配置信息意外泄露的情况下，增加攻击者推导签名机制的技术难度。
 
### 5.3 签名计算流程
1.  **准备基串**: 收集请求元数据并进行规范化拼接。
2.  **派生密钥**: 对原始密钥执行 `reverse-and-slice` 操作。
3.  **HMAC 运算**: 采用 **HMAC-SHA256** 算法计算哈希摘要。
4.  **编码输出**: 将摘要进行 Base64 编码，并作为 `X-Api-Sign` 请求头提交。

## 6. 安全常见问题 (FAQ)

**Q: 为什么我的签名总是校验失败？**
A: 请确认签名基串的拼接顺序是否严格遵循规范。特别注意 Request Body 在 GET 请求中应为空字符串，且 Timestamp 必须为服务器当前时间的 ±5 分钟内。

**Q: JWT 密钥泄露后如何紧急处理？**
A: 应立即在配置中心更新 `jwt_secret`。这将导致所有现有的活跃 Token 立即失效，用户需重新登录以获取新的 Token。

---
[返回目录](../index.md)
