---
title: 隐私同意与成绩同步
slug: privacy-sync
sidebar_label: 隐私与成绩同步
sidebar_position: 7
---


## 目标

在**不上传教务 Cookie / 精确 GPS** 的前提下，支持：

1. 设备注册 → 精准推送端点  
2. 目的同意（purpose consent）→ 门禁云同步与分析  
3. 课表云快照 → 跨设备恢复  

## 登录会话（踢下线 / 设备信息）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/user/sessions` | 登录会话列表（含 `isCurrent`、IP、UA、设备字段） |
| DELETE | `/api/v1/user/sessions/{session_id}` | 踢下线（吊销会话 + refresh） |
| DELETE | `/api/v1/user/sessions` | 吊销全部会话 |
| PATCH | `/api/v1/user/sessions/device` | 给当前/指定会话挂设备名、型号、系统等 |

列表项字段：`sessionId`, `ipAddress`, `userAgent`, `deviceId`, `deviceName`, `platform`, `osVersion`, `appVersion`, `createdAt`, `lastSeenAt`, `isCurrent`。

客户端在登录后应调用 `PATCH .../sessions/device` 或 `POST /devices/register`（会尽力回写当前 session）。

## 推送设备注册

`POST /api/v1/devices/register`（登录）

```json
{
  "platform": "android",
  "push_token": "...",
  "device_id": "stable-install-uuid",
  "push_provider": "fcm",
  "app_version": "1.2.0",
  "os_version": "14",
  "locale": "zh-CN",
  "timezone": "Asia/Shanghai"
}
```

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/devices` | 推送设备列表（**不含** raw token） |
| DELETE | `/api/v1/devices/{id}` | 删除推送注册 |

- 优先按 `(user_id, device_id)` 更新；否则按 `push_token` upsert  
- 表：`user_devices`  
- **与登录会话分离**：踢会话 ≠ 自动删推送 token（可一并调 DELETE）

## 隐私同意（非 OAuth 客户端授权）

| 方法 | 路径 |
|------|------|
| GET | `/api/v1/user/privacy/consents` |
| PUT | `/api/v1/user/privacy/consents` |

Purpose 白名单：

| purpose | 含义 |
|---------|------|
| `sync.transcript` | 成绩上云 / 评价资格 |
| `sync.timetable` | 课表云快照 |
| `sync.agenda` | 日程（预留） |
| `sync.prefs` | 非敏感设置（预留） |
| `push.course` | 上课提醒类推送 |
| `push.forum` | 论坛推送 |
| `push.system` | 系统推送 |
| `analytics.usage` | 可选行为事件 |

缺省未写入 = **未授权**。与 OAuth `OAuthConsentGrant` 完全分离。

## 课表云同步

需 `sync.timetable` 同意。

| 方法 | 路径 |
|------|------|
| PUT | `/api/v1/user/sync/timetable` |
| GET | `/api/v1/user/sync/timetable` |

```json
{
  "schema_version": 1,
  "client_rev": "client-generated-id",
  "device_id": "install-uuid",
  "payload": { "timetables": [] }
}
```

- `payload` 为客户端课表 store 的 JSON（≤512KB）  
- 服务端 LWW upsert，返回 `server_rev`  
- 表：`user_timetable_snapshots`  
- **不含**学号 / Cookie

## 成绩同步

已有 `POST /api/v1/user/transcript/sync`。上线后建议同样要求 `sync.transcript` consent（可在下一刀接入 `RequirePrivacyConsent`）。

## 禁止上传

- 教务 Cookie / 密码 / CASTGC  
- 精确 GPS 轨迹  
- AI 对话全文（除非单独同意与域）  

## 扩展新同步域

1. 增加 purpose 常量  
2. 新表 + `PUT/GET /api/v1/user/sync/{domain}`  
3. Handler 内 `RequirePrivacyConsent`  
4. 文档与客户端开关  

不必做通用「任意 JSON 桶」主库。
