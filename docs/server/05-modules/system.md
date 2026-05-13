# 系统管理与管控

## 模块概述
本模块负责 App 的版本生命周期管理、远程配置以及推送设备注册。

## 核心功能
### 1. 版本检查
服务端存储各平台的最新版本信息、更新日志及下载链接。
- 支持“强制更新”标识。
- 支持灰度下发（未来计划）。

### 2. 远程配置
提供 KV 存储用于动态控制 App 行为：
- `maintenance_mode`: 全站维护开关。
- `ai_feature_enabled`: AI 助手开关。
- `emergency_notice`: 紧急公告内容。

### 3. 设备注册
用于存储客户端上报的 FCM/APNs 推送令牌。
- 建立 `UserID` 与 `PushToken` 的绑定关系。
- 记录设备平台（Android/iOS）以便定向推送。

## 接口说明
- `GET /api/v1/system/update`: 检查新版本。
- `GET /api/v1/system/config`: 获取所有远程配置。
- `POST /api/v1/devices/register`: 注册设备令牌。
