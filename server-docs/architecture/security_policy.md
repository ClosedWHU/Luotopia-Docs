---
sidebar_position: 3
title: 安全策略
sidebar_label: 安全策略
slug: security-policy
---

当前安全模型：HTTPS + Bearer JWT（或会话 / 用户 API 凭证）+ 服务端鉴权与限流。

- 不做：全站请求 HMAC / `X-Api-Sign`（说明见 [已移除与迁移](../meta/removed_and_migrated.md#全站请求-hmac)）。
- 实现：`internal/middleware/huma_auth.go`、`httpapi` Access 注册表、限流中间件。

## 1. 认证机制

### 1.1 JWT 令牌（主路径）

- 签署算法：HS256，密钥为 `security.jwt_secret`。
- 载荷（Claims）：含用户 ID、用户名、角色、是否管理员、可选 `session_id`，以及标准 `exp`。
- 使用方式：`Authorization: Bearer <access_token>`。
- 会话绑定：若 JWT 含 `session_id`，服务端会校验会话是否仍有效；吊销会话后 token 立即失效。

### 1.2 OIDC / SSO 会话

- 遵循 OpenID Connect；Web 端可通过会话 Cookie 认证。
- 交换状态（`state` / `nonce`）短有效期，降低 CSRF 与重放风险。

### 1.3 用户 API 凭证（集成用）

- 用户可创建自己的 `API Key` + `API Secret`（个人开发者/脚本集成）。
- 用法：请求头同时携带 `X-Api-Key` 与 `X-Api-Secret`（明文比对/哈希校验凭证本身）。
- **不是**全站共享的请求 HMAC 签名；也不对 body 做 `X-Api-Sign`。
- 权限较窄：默认仅允许部分只读 GET（如 courses / teachers / reviews / search / random）。
- 另有凭证级 RPM / RPH / 日 / 月配额（与接口限流叠加）。

### 1.4 匿名与 Access 声明

`/api/v1/*` **默认需要认证**。公开接口在注册时声明 `Access: Public`（`httpapi.Register`），同时写入 OpenAPI Security 与运行时 Access 表。

典型公开能力包括（完整列表以 OpenAPI 与代码注册为准）：

- 注册、登录、token 刷新、邮箱验证、密码重置、MFA / Passkey 登录相关
- 验证码配置 / Altcha 挑战
- 系统更新检查、密码策略、部分公开读（搜索、课评读、校巴等，以 `AccessPublic` 为准）
- 头像二进制 `GET /api/v1/avatars/{id}`、论坛 `GET /api/v1/forum/health`

未在 Access 表注册的 `/api/v1` 操作按需登录。写法见 [HTTP 注册规范](../api/http_api.md)。

## 2. 授权机制

### 2.1 角色 / Access

1. Public：无需登录（仅声明为 Public 的操作）。
2. Optional：有有效凭证则认证，无 / 失效则匿名放行（不拒绝请求）。
3. User：登录用户（JWT / Session；部分路径允许 API Key）。
4. Admin：管理能力（admin 或 superadmin）。
5. SuperAdmin：更敏感管理（用户、队列、缓存、embedding 等；路径与 Access 声明双重约束）。

### 2.2 路由保护

- 业务 API 经 `httpapi.Register` 声明 `Access`；`NewHumaAuthMiddleware` 按 Access 注册表与路径规则强制执行。
- OpenAPI 的 `Security` 由 Access 生成。
- 传输层安全依赖 HTTPS（生产 `server.public_base` 应为 `https://`）。

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
| 食堂 | `dining:manage` `dining:moderate` |
| 云控 | `cloud-control:manage` |

> [!IMPORTANT]
> 上表为启动引导种子化的权限码；未列出的权限码默认不授予任何角色，需在 RBAC 中手工创建并授予后方可通过校验。

## 3. 安全防御措施

### 3.1 速率限制

- 默认：未单独声明 Rate 的操作回落到默认 IP 配额；配额与窗口机制以部署配置（`security.rate_limit`）为准。
- 按操作声明：敏感操作可在注册时通过 `httpapi.Op.Rate` 单独声明配额。
- 豁免：基础设施与静态读路径可豁免限流，清单以实现为准。
- 登录等路径仍可叠加 identity 侧尝试次数限制。

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

### 3.5 客户端版本兼容门禁

对 `/api/v1/*` 按客户端版本治理新旧 App 兼容（实现：`internal/middleware/version_gate.go`，配置：`client_versions`）：

- 客户端声明：新版请求携带 `X-App-Version`（`1.4.0+42`）与 `X-App-Platform`（android/ios/…）；无头时回落到 User-Agent `Luotopia/1.4.0+42 (android)` 解析，两者皆无视为 legacy（早于该机制发布的客户端）。
- 三态模式 `off / log / enforce`，可按平台覆盖：
  - 低于 `deprecated_below`：响应附 `Deprecation: true` 与 `Sunset`（HTTP 日期）头，请求照常处理——弃用必须先公告后强制；
  - 低于 `min_supported` 且 `enforce`：返回 **426 Upgrade Required**，业务码 `9008`，`details` 携带 `min_version` / `update_url` / `platform`；
  - `log`：仅记录（同一决策每分钟节流一条），用于强制前观察旧版流量占比。
- legacy 请求由 `legacy_mode` 治理（默认 `log`，永不默认阻断）；到达公告的停止支持日期后才切 `enforce`。
- 版本无法解析时按 legacy 处理而不是拒绝：门禁目标是兼容性治理，不是安全边界。
- 解析后的客户端信息经 `middleware.GetClientInfo(ctx)` 提供给后续处理器（feature gate、响应裁剪、风控）。

配置样例（`config.json`）：

```json
"client_versions": {
  "mode": "off",
  "legacy_mode": "log",
  "update_url": "https://www.whu.sb",
  "platforms": [
    {
      "platform": "android",
      "deprecated_below": "1.6.0",
      "sunset": "2026-12-01T00:00:00Z",
      "min_supported": "1.5.0",
      "mode": "log"
    }
  ]
}
```

上线节奏：先 `log` 观察旧版占比 → 配 `deprecated_below` + `sunset` 公告 → 到期后把对应平台切 `enforce`。

### 3.6 设备证明与信任分级

对设备做**分级**而不是准入（实现：`internal/domains/identity/service/device_attestation*.go`，端点：`/api/v1/device/attestation*`，配置：`identity.security.attestation`）：

- 流程：登录后的客户端取一次性 challenge（Redis，10 分钟，绑定 user+install，GetDel 单次消费）→ 在硬件密钥库生成/持有 P-256 密钥并嵌入 challenge → 提交证明 → 服务端验证并落库 `(user, install)` 的信任记录（含设备公钥 PKIX，供后续 token 绑定使用）。
- 验证矩阵（面向中国大陆兼容，不依赖 GMS 运行时）：
  - **iOS**：Apple App Attest（`DCAppAttestService`），App ID 复用 `identity.webauthn.appleAppIDs`；生产环境验证失败自动重试 development 环境（覆盖 TestFlight/开发签名）；
  - **Android（Google 链）**：KeyStore 硬件密钥证明链对 Google 硬件证明根验证 + KeyDescription 检查（TEE/StrongBox、PurposeSign、Origin=GENERATED、非 AllApplications、包名匹配、VerifiedBoot）；
  - **Android（无 GMS/华为）**：链不根于 Google 时接受 **HMS SafetyDetect SysIntegrity** JWT（华为 CBG 根 + PS256 + `sysintegrity.platform.hicloud.com` + basicIntegrity + 包名 + nonce=challenge）；密钥描述同时嵌有 challenge 则 high，仅 HMS 通过则 medium；
  - **软件兜底**：以上都不可用（老旧 ROM、异常 GMS、桌面端）时走 `software` 类型：客户端自报完整性判定（freeRASP）+ 软件密钥，永远被接受，永远 low。
- 信任分级 → 有效期：high 14 天 / medium 3 天 / low 24 小时（可配）。**任何验证失败都降级不拒绝**——证明失败的设备照常使用 API，只是拿到最低的信任等级；这避免了"部分机型无法签发凭据导致完全不可用"的事故模式。
- 信任根：Google 硬件证明根（多代并存）与华为 CBG 根内嵌于 `device_attestation_roots.go`（公开 CA 证书，非机密）；Apple 根由 `bas-d/appattest` 库内嵌。

### 3.7 Token 发送方约束（DPoP，RFC 9449）

对携带设备密钥的访问令牌做持有证明（实现：`internal/middleware/dpop.go`，配置：`identity.security.dpop`）：

- 客户端在登录/刷新时用设备密钥签发一个 `DPoP` 证明（JWT，`typ=dpop+jwt`、`alg=ES256`、`jwk` 公开密钥、`htm/htu/jti/iat`）；服务端验证后把密钥的 RFC 7638 指纹写入新访问令牌的 `cnf.jkt`。
- 后续每个请求，若令牌带 `cnf.jkt`，则必须附上匹配该密钥的 `DPoP` 证明（含 `ath`=访问令牌哈希，`jti` 单次使用防重放，`iat` ±5 分钟窗口）；不匹配返回 401（业务码 `1021`）。
- **兼容性结构性内建**：不带 `cnf` 的令牌（旧客户端、Web 会话）是普通 bearer，永不被要求证明；签发时证明缺失/无效只意味着铸造未绑定的 bearer 令牌，绝不阻断登录。
- 三态模式 `off / log / enforce`：`log` 校验并记录但不拒绝，用于灰度观察；默认 `enforce`。`htu` 按路径比对（忽略 scheme/host），以兼容 TLS 终止代理。

## 4. 当前请求安全模型

1. TLS（HTTPS）保护信道  
2. 客户端版本门禁（兼容治理，426/Deprecation）  
3. 用户级 JWT / Session / API 凭证证明身份  
4. 服务端授权与限流（Access + Rate）

## 5. 漏洞反馈

如发现安全漏洞，请通过项目仓库 Security 渠道或维护者联系方式报告。

## 6. FAQ

**Q：为什么没有请求体签名？**  
A：当前模型为 HTTPS + 用户凭证；旧全站 HMAC 见 [已移除与迁移](../meta/removed_and_migrated.md#全站请求-hmac)。

**Q：JWT 密钥泄露后怎么办？**  
A：立即轮换 `security.jwt_secret`，并视情况吊销会话；已签发的 access token 在旧密钥下仍可能有效至过期，应配合短 TTL 与会话绑定。

**Q：不需要登录的接口如何声明？**  
A：注册时使用 `Access: Public`。见 [HTTP 注册规范](../api/http_api.md)。

**Q：旧的匿名路径表 / huma.Register 去哪了？**  
A：见 [已移除与迁移 · HTTP 路由注册](../meta/removed_and_migrated.md#http-路由注册huma--httpapi)。

## 相关

- [HTTP 注册规范](../api/http_api.md)
- [配置手册](../deployment/config.md)
- [服务端概览](../index.md)
