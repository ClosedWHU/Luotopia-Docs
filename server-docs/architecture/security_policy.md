---
sidebar_position: 3
title: 安全策略
sidebar_label: 安全策略
slug: security-policy
---

> **一句话**：HTTPS + Bearer JWT（或会话 / 用户 API 凭证）+ 服务端鉴权与限流。  
> **不做**：全站请求 HMAC / `X-Api-Sign`（说明见 [已移除与迁移](../meta/removed_and_migrated.md#全站请求-hmac)）。  
> 实现：`internal/middleware/huma_auth.go`、`httpapi` Access 注册表、限流中间件。

## 1. 认证机制

### 1.1 JWT 令牌（主路径）

- **签署算法**: HS256，密钥为 `security.jwt_secret`。
- **载荷 (Claims)**: 含用户 ID、用户名、角色、是否管理员、可选 `session_id`，以及标准 `exp`。
- **使用方式**: `Authorization: Bearer <access_token>`。
- **会话绑定**: 若 JWT 含 `session_id`，服务端会校验会话是否仍有效；吊销会话后 token 立即失效。

### 1.2 OIDC / SSO 会话

- 遵循 OpenID Connect；Web 端可通过会话 Cookie 认证。
- 交换状态（`state` / `nonce`）短有效期，降低 CSRF 与重放风险。

### 1.3 用户 API 凭证（集成用）

- 用户可创建自己的 `API Key` + `API Secret`（个人开发者/脚本集成）。
- **用法**: 请求头同时携带 `X-Api-Key` 与 `X-Api-Secret`（明文比对/哈希校验凭证本身）。
- **不是** 全站共享的请求 HMAC 签名；也**不**对 body 做 `X-Api-Sign`。
- 权限较窄：默认仅允许部分只读 GET（如 courses / teachers / reviews / search / random）。
- 另有凭证级 RPM / RPH / 日 / 月配额（与接口限流叠加）。

### 1.4 匿名与 Access 声明

`/api/v1/*` **默认需要认证**。公开接口在注册时声明 **`Access: Public`**（`httpapi.Register`），同时写入 OpenAPI Security 与运行时 Access 表。

典型公开能力包括（完整列表以 OpenAPI 与代码注册为准）：

- 注册、登录、token 刷新、邮箱验证、密码重置、MFA / Passkey 登录相关
- 验证码配置 / Altcha 挑战
- 系统更新检查、密码策略、部分公开读（搜索、课评读、校车等，以 `AccessPublic` 为准）
- 头像二进制 `GET /api/v1/avatars/{id}`、论坛 `GET /api/v1/forum/health`

未在 Access 表注册的 `/api/v1` 操作按需登录。写法见 [HTTP 注册规范](../api/http_api.md)。

## 2. 授权机制

### 2.1 角色 / Access

1. **Public**: 无需登录（仅声明为 Public 的操作）。
2. **User**: 登录用户（JWT / Session；部分路径允许 API Key）。
3. **Admin**: 管理能力（admin 或 superadmin）。
4. **SuperAdmin**: 更敏感管理（用户、队列、缓存、embedding 等；路径与 Access 声明双重约束）。

### 2.2 路由保护

- 业务 API 经 `httpapi.Register` 声明 `Access`；`NewHumaAuthMiddleware` 按 Access 注册表与路径规则强制执行。
- OpenAPI 的 `Security` 由 Access 生成。
- 传输层安全依赖 **HTTPS**（生产 `server.public_base` 应为 `https://`）。

### 2.3 系统权限码

部分 `AccessAdmin` 操作另声明细粒度权限码（`httpapi.Op.Permission`），由 RBAC 校验。启动引导时种子化以下系统权限（`internal/platform/database/bootstrap_users.go`），并同时授予 `admin` 与 `superadmin` 角色：

| 分组 | 权限码 |
|------|--------|
| 课程 | `course:create` `course:edit` `course:delete` `course:list` `course:view` `course:merge` |
| 课评 | `review:list` `review:view` `review:edit` `review:delete` `review:approve` |
| 教师 | `teacher:create` `teacher:list` `teacher:view` `teacher:merge` |
| 资料 | `material:approve` `material:delete` |
| 用户 | `user:list` `user:view` `user:edit` `user:delete` `user:set_admin` `user:disable` `user:batch` `user:update-limits` `user:credentials` |
| 缓存 / 运维 | `cache:clear` `cache:warmup` `task:manage` `queue:manage` `security:manage` `storage:manage` `embedding:create` |
| 论坛 | `forum:config` `forum:moderate` `forum:manage-users` |
| 食堂 | `dining:manage` |

> [!IMPORTANT]
> `teacher:delete` 被 course_review 教师管理端点强制（`GET/DELETE/PUT /api/v1/admin/teachers/...`，见 `teacher_handler.go` 与 `teacher_admin.go`），但**不在**上述种子清单中：`admin` 角色默认无此权限，仅 `superadmin` 直通（`CheckClaimsPermission`，`internal/middleware/auth.go`）或需手工创建该权限并授予角色。

## 3. 安全防御措施

### 3.1 速率限制

- **默认**：未单独声明时，对 `/api/v1/*` 按 IP 约 50 次/分钟（Redis 多窗口）。
- **按操作声明**：`httpapi.Op.Rate`（单窗口或多层：分钟/小时/天；主体 IP / User / UserOrIP）。
- **共享预算**：相同 `Scope` 的多个操作共用计数（如头像上传与删除）。
- **豁免**：头像 GET、health/ready/metrics，以及 `Exempt: true`。
- 登录等路径仍可叠加 identity 侧尝试次数窗口。

详见 [HTTP 注册规范 · 限流](../api/http_api.md#4-限流)。

### 3.2 人机校验

- Altcha / Turnstile 等保护注册、登录、重置密码等高成本匿名接口。
- 路径以代码中间件白名单为准（如 `POST /api/v1/user/login`）。

### 3.3 数据保护

- 密码 bcrypt 哈希。
- 用户 API Secret 优先存哈希。
- 日志与管理审计避免输出密码、token 等敏感字段。
- 客户端错误文案不包含数据库或系统底层细节。

### 3.4 Metrics 暴露

- Prometheus `/metrics` **默认不在业务 API 端口公开**。
- 独立监听：`monitoring.metrics_host` + `metrics_port`（默认 `127.0.0.1:9090`）。
- 可选 Basic Auth；仅当 `expose_metrics_on_api=true` 时才挂到主 API。

## 4. 当前请求安全模型

1. **TLS（HTTPS）** 保护信道  
2. **用户级 JWT / Session / API 凭证** 证明身份  
3. **服务端授权与限流**（Access + Rate）

## 5. 漏洞反馈

如发现安全漏洞，请通过项目仓库 Security 渠道或维护者联系方式报告。

## 6. FAQ

**Q: 为什么没有请求体签名？**  
A: 当前模型为 HTTPS + 用户凭证；旧全站 HMAC 见 [已移除与迁移](../meta/removed_and_migrated.md#全站请求-hmac)。

**Q: JWT 密钥泄露后怎么办？**  
A: 立即轮换 `security.jwt_secret`，并视情况吊销会话；已签发的 access token 在旧密钥下仍可能有效至过期，应配合短 TTL 与会话绑定。

**Q: 不需要登录的接口如何声明？**  
A: 注册时使用 `Access: Public`。见 [HTTP 注册规范](../api/http_api.md)。

**Q: 旧的匿名路径表 / huma.Register 去哪了？**  
A: 见 [已移除与迁移 · HTTP 路由注册](../meta/removed_and_migrated.md#http-路由注册huma--httpapi)。

---
[返回目录](../index.md)
