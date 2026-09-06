---
title: 认证与账号
sidebar_label: 认证与账号
sidebar_position: 8
description: 珞家 JWT、武大教务会话、开发者服务器
---

客户端有两套身份，**不要混用**。

## 对比

| | 武大 / 教务 | 珞家 Luotopia |
|--|-------------|---------------|
| 代码 | `features/whu_auth/` | `features/luotopia_auth/` |
| 用途 | 课表导入、成绩、座位、场馆、E 卡… | 社区、评价等云端 API |
| 存储 | 本机会话 / Cookie | access + refresh token |
| 是否发往珞家 API | **否**（Cookie 不上云） | 是（Bearer） |

用户操作见 [用户指南](pathname:///user/)。

## 珞家 JWT

1. 登录 / 注册：`LuotopiaAuthRepository` → 服务端 identity  
2. Token：secure storage（见 `core/security` 等）  
3. 请求：`api_providers.dart` 注入 `Authorization: Bearer …`  
4. 401：拦截器调用 `refreshSession`，成功则重试，失败则清会话  

服务端默认 `/api/v1/*` 需登录；白名单见 [服务端安全策略](pathname:///server/architecture/security-policy)。

## Base URL

| 配置 | 典型 |
|------|------|
| `AppConfig.apiBaseUrl` | 模拟器 `http://10.0.2.2:6262`，其它 `http://localhost:6262` |
| 开发者 `customServerUrl` | 覆盖默认，如 `http://10.0.2.2:6262` |
| `AppConfig.siteBaseUrl` | 官网 `https://www.whu.sb`（更新 / 热更新 / 法律 / 友情链接） |

开启：设置 → 关于 → 连点版本 → 开发者设置。

`customServerUrl` **只**覆盖珞家业务服，**不**改变 `siteBaseUrl`。

## 武大教务

- 登录页 / 设置中的武大账号  
- 生命周期：后台过久可主动刷新教务会话  
- WebView 校园业务：统一用 `AppWebViewPage` 模式挂 Cookie / Header  

详见 [校园页教务认证](./campus-whu-auth.md)。

## 迁移提示

全站请求 HMAC 与旧校园目录等已集中见 [已移除与迁移](./removed-and-migrated.md)。

仍须遵守：不要把教务 Cookie 放到 Luotopia REST body/header 让服务端代爬。

## 相关

- [API 对接](./api-integration.md)
- [校园功能](./campus.md)
- [已移除与迁移](./removed-and-migrated.md)
- [服务端 API](pathname:///server/api/overview)
