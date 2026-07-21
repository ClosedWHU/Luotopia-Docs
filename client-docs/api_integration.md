---
title: API 对接
sidebar_label: API 对接
sidebar_position: 9
description: Dio、Bearer JWT、customServerUrl
---
# API 对接

## 约定

| 项 | 位置 / 行为 |
|----|-------------|
| Dio（业务） | `core/api/api_providers.dart` |
| OpenAPI 生成 | `core/api_client/` |
| 珞家登录 | `features/luotopia_auth/` |
| 认证头 | `Authorization: Bearer <token>` |
| 401 | refresh 后重试 |
| 自定义服务器 | 开发者 `customServerUrl` |
| 请求签名 | **无**（个别校园第三方如座位预约另有 HMAC，与业务服无关） |
| 官网 HTTP | `package:http`（更新、热更新、友情链接等） |

服务端总览：[API 使用指南](pathname:///server/api/overview)。

## Base URL

见 [认证 · Base URL](./auth.md#base-url)。业务 Dio 与官网 `siteBaseUrl` 分离。

## 接线示意

```dart
final baseUrl = devSettings.customServerUrl?.isNotEmpty == true
    ? devSettings.customServerUrl!
    : config.apiBaseUrl;

final dio = Dio(BaseOptions(baseUrl: baseUrl));
if (token != null) {
  dio.options.headers['Authorization'] = 'Bearer $token';
}
// QueuedInterceptor: 401 → refresh → 重试
```

## 安全边界

1. 生产 HTTPS  
2. 用户 JWT + 服务端鉴权  
3. 教务 Cookie 只在 `whu_auth`  

## 联调清单

- [ ] `/health` 通  
- [ ] 开发者 URL = `server.port`  
- [ ] 登录后带 Bearer  

## 相关

- [环境搭建](./setup.md)
- [认证](./auth.md)
- [服务端安全](pathname:///server/architecture/security-policy)
