---
title: 目录结构
sidebar_label: 目录结构
sidebar_position: 3
description: app/lib 目录分层与依赖方向
---

仓库路径：`app/lib/`。约定见 `app/lib/README.md`。

## 顶层

```text
app/lib/
├── main.dart
├── app/              # 启动、路由、Shell、装配
├── core/             # 与业务无关的基础设施
├── features/         # 按功能切分（页面 / 账户 / 天气…）
├── shared/           # 跨 feature 的领域模型与通用 UI
└── toolkit/          # AI Agent 工具运行时（application / credentials / data）
```

`toolkit/data/` 存放工具适配器（如 `payment_checkout_vault.dart`、`water_electric_adapters.dart`、`school_net_adapters.dart`），`toolkit/application/` 为工具与 catalog 定义，`toolkit/credentials/` 为凭据 provider。

仓库级相关目录（`app/` 下）：`ohos/`（HarmonyOS 工程）、`packages/`（本地 Dart 包：`luotopia_agent_harness`、`luotopia_agent_tool_runtime`、`luotopia_flutter_bridge`、`luotopia_toolkit_core`、`luotopia_toolkit_virtual_cli`）、`native/`（Rust 原生组件）、`tool/ohos/`（鸿蒙构建脚本）。

## core/

适合：主题、l10n、存储、网络、配置、平台适配、图标语义（如 `AppIcons`）。

不适合：具体「课表 / 事项」业务规则、某一页的私有 UI。

## features/

| 区域 | 说明 |
|------|------|
| `features/pages/` | 完整页面：home、list、campus、settings、ai、forum… |
| `features/luotopia_auth/` | 珞家账户 |
| `features/whu_auth/` | 武大教务认证 |
| `features/weather/` | 天气（直连第三方） |
| `features/campus_bus/` | 校巴数据与预览卡片 |
| `features/app_update/` | 安装包版本检查（官网 Pages Function） |
| `features/hot_update/` | 解析脚本热更新（manifest + Ed25519） |
| `features/forum/`、`course_review/` 等 | 其他独立能力 |

页面内部可按需有 `presentation` / `domain` / `data`，**不为占位强行建空目录**。

校园子应用：`features/pages/campus/sub_apps/<子应用>/`，与校园页入口一一对应。

## shared/

跨模块实体、仓储接口、值对象、可复用业务组件。  
不承载启动逻辑，不提供整页 Scaffold 脚手架。

## 依赖方向

```text
presentation  →  domain
data          →  domain
app           →  features / core / shared
```

- `domain` 禁止依赖 `presentation` / `data`
- feature 之间避免深耦合；复用优先进 `shared/`

## 路由

路径常量：`app/lib/app/router/app_route_paths.dart`  
校园子路由、设置子路由分文件注册（`campus_*_routes`、`settings_*_routes`）。

## 相关

- [架构总览](./architecture.md)
- [功能模块](./features.md)
