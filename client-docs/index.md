---
id: index
slug: /
sidebar_position: 0
title: 客户端开发
description: Flutter 客户端文档入口
sidebar_label: 概览
---
# 客户端开发

Flutter 跨平台 App（Riverpod + Material 3 + go_router）。代码在 monorepo 的 `app/`。

侧栏按阅读顺序排列。快速跳转：

| 你想… | 去 |
|--------|-----|
| 装环境、联调后端 | [环境搭建](./setup.md) |
| 目录与分层 | [架构](./architecture.md) · [目录结构](./project-structure.md) · [Feature 约定](./feature-architecture.md) |
| 状态 / UI | [状态管理](./state_management.md) · [UI 与组件](./components.md) · [多端](./multi_platform.md) |
| 登录与业务 API | [认证](./auth.md) · [API 对接](./api_integration.md) |
| 校园子应用 | [校园功能](./campus.md) · [教务认证](./campus-whu-auth.md) · [子应用目录](./campus-sub-apps.md) · [WebView](./webview.md) |
| 能力地图 / 更新 | [功能模块](./features.md) · [更新与热更新](./updates.md) |
| 测试 / 迁移项 | [测试](./testing.md) · [已移除与迁移](./removed-and-migrated.md) |

其它分区：

- [用户怎么用 App](pathname:///user/)
- [服务端开发](pathname:///server/)

## 几条硬约定

- UI：**Material 3**（含 M3E loading；SnackBar 用 `showAppSnackBar*`）
- 业务 API：`Authorization: Bearer`，无请求 HMAC 签名
- 武大教务会话：只在设备本地（`whu_auth`）
- 天气：客户端直连第三方
- 安装包更新 / 解析脚本热更新：官网 `www.whu.sb`（homepage），**不是**业务服 `system/update`  
- Feature 分层与迁址状态：[Feature 约定](./feature-architecture.md)

公开文档只写到**契约与工程边界**；第三方协议细节与密钥见 [公开文档边界](pathname:///server/meta/public-docs-policy)。
