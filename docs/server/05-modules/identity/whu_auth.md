# 武汉大学强认证 (WHU CAS / HAM)

Luotopia 通过集成 **HAM Gateway** 实现了针对武汉大学师生的强认证。这确保了社区用户的真实身份背景，同时为校园业务（如课表同步）提供了基础。

## 1. 核心架构
认证流程基于标准的 OAuth 2.0 协议，服务端通过 `HamGatewayClient` 与 HAM 开放平台（`open-api.ham.nowcent.cn`）进行交互。

### 1.1 认证流
1. **引导**: 客户端引导用户打开 HAM 登录页面。
2. **回调**: 用户登录成功后，HAM 回调 Luotopia 服务端并携带 `code`。
3. **换码 (`ExchangeToken`)**: 服务端调用 HAM API，使用 `code` 换取 `access_token`。
4. **获取信息 (`GetUserInfo`)**: 使用 `access_token` 获取用户的 OpenID 和校园身份信息。

## 2. 身份映射逻辑 (Identity Mapping)

### 2.1 身份信息结构
HAM 返回的 `HamUserInfoResponse` 包含以下关键字段：
- `open_id`: 用户的唯一标识（跨 App 保持不变）。
- `is_student`: 布尔值，用于区分学生与教工。
- `nickname`: HAM 系统中的默认昵称。

### 2.2 内部映射 (`internal/identity/service`)
- **关联**: 如果用户是首次登录，系统会根据 `open_id` 创建新的 `UserRecord`。
- **权限授予**: `is_student` 字段决定了用户是否拥有访问“校园生活”模块（如空闲教室、课表导入）的初始权限。
- **安全性**: 所有的 `access_token` 在交换完成后均不直接暴露给前端，而是转化为 Luotopia 自身的 JWT。

## 3. 业务应用：HAM 令牌的特殊用途
由于 HAM 提供的 `access_token` 具有访问特定校园 API（如教务系统代理）的能力，服务端会在有效期内加密存储该令牌，用于后续的：
- **一键导入课表**: 调用校园代理层拉取实时排课数据。
- **校友验证**: 验证用户的学院、年级信息以分配特定板块权限。

## 4. 配置指南
在 `config.json` 的 `identity.social.providers` 中添加 HAM 配置：
```json
{
    "id": "ham",
    "client_id": "YOUR_HAM_APP_ID",
    "client_secret": "YOUR_HAM_APP_SECRET",
    "scopes": ["openid", "profile"]
}
```

## 5. 常见问题 (FAQ)
 
**Q: 用户在认证成功后跳转回 App 失败怎么办？**
A: 请检查客户端注册的 `URL Scheme` 是否与后端配置中的 `redirect_uri` 完全匹配。如果是 iOS 系统，请确保已在 `Info.plist` 中正确声明。
 
**Q: 能否在不接入 HAM 的情况下测试登录？**
A: 可以。在开发环境下，系统提供 `mock` 模式，可在配置文件中开启以跳过真实的 OAuth 跳转。

---
[返回目录](./index.md)
