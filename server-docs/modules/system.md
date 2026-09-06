---
title: 系统管理
sidebar_label: 系统管理
sidebar_position: 13
---

代码：`internal/domains/system`。

## API（当前）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/system/update` | 业务服侧更新检查（若启用） |
| GET | `/api/v1/system/config` | 远程配置 KV |

设备推送 token 注册在 **identity**：

- `POST /api/v1/devices/register`（需登录）

## 与「App 商店式更新 / 热更新」的边界

当前 **Flutter 客户端主路径** 不依赖本域做安装包分发：

| 能力 | 实际来源 | 说明 |
|------|----------|------|
| 检查最新 APK/桌面包 | 官网 Pages Function `GET https://www.whu.sb/api/releases/latest` | 代理 GitHub Releases；`?prerelease=1` 含预发布 |
| 解析脚本热更新 | 静态 `https://www.whu.sb/hot-update/` | manifest + Ed25519；代码在 `app/features/hot_update` |

`/api/v1/system/update` 仍可作为服务端远程配置能力保留，**勿与官网发布流混为一谈**。字段以 OpenAPI 为准。

## 说明

- 远程配置键集合以实现与运营配置为准（如维护开关等），勿假设固定键名永远存在。  
- 版本检查请求参数（platform 等）以 OpenAPI 为准。

---
[返回模块总览](./index.md)
