---
title: 环境搭建
sidebar_label: 环境搭建
sidebar_position: 1
description: Flutter 安装、运行与后端联调
---
# 环境搭建

## 前置

- Flutter 3.x / Dart 3.x  
- VS Code 或 Android Studio  
- 模拟器或真机  

## 安装与运行

```bash
cd app
flutter pub get
flutter run
```

### Android Release 构建

```bash
# Windows：默认仅 arm64（覆盖绝大多数真机）
build-release.bat
# 全 ABI：build-release.bat all
```

脚本启用 `--obfuscate` 与 split debug info。Cargo/fjs 缓存目录见 `.gitignore` 中的 `.cargo-target`（避免 `flutter clean` 清掉数十分钟编译缓存）。

iOS / 桌面发布脚本见 `app/build-ios*.sh`、Windows MSIX 配置（`pubspec` `msix_config`），以仓库脚本为准。

## 联调后端

1. 启动服务端（[服务端环境搭建](pathname:///server/development/setup)），端口样例 **6262**。  
2. App：**设置 → 关于**，连点版本打开 **开发者模式**。  
3. **开发者设置** 填自定义服务器（Auth 与业务 API 共用）：
   - 模拟器：`http://10.0.2.2:6262`
   - 真机：`http://<电脑局域网IP>:6262`
4. 可选：扫描局域网探测 `:6262/health`。

默认 Auth 与 OpenAPI 端口可能不一致——联调务必用自定义 URL **统一**。

官网（检查更新 / 热更新 / 友情链接）不走该自定义服务器，仍访问 `https://www.whu.sb`。

## OpenAPI 客户端

生成物在 `lib/core/api_client`。从运行中服务拉：

```bash
curl http://localhost:6262/openapi.json -o server_api.json
```

再按仓库 `openapitools.json` / 脚本生成；勿手改生成文件。

## 常见问题

| 问题 | 处理 |
|------|------|
| iOS 依赖 | `cd ios && pod install` |
| 连不上后端 | 端口、防火墙、同一局域网 |
| 401 循环 | 查 refresh 与服务器时间 / 密钥 |
| Release 无法检查更新 | 见 [更新与热更新](./updates.md)；多为 prerelease / 官网接口 |

## 相关

- [认证](./auth.md)
- [API 对接](./api_integration.md)
- [更新与热更新](./updates.md)
- [用户指南](pathname:///user/)
