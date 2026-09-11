---
title: 模块详解
sidebar_label: 模块详解
description: internal/domains 模块索引与状态
sidebar_position: 0
---

代码在 `server/internal/domains/`（底座：`platform`、`middleware`、`services`）。  
**字段与路由以 OpenAPI 为准**；下列「状态」列为快速索引。

## 核心业务

| 模块 | 路径 | 文档 | 状态 |
|------|------|------|------|
| 身份 / OIDC | `identity/` | [identity](./identity/index.md) | 主路径 |
| 论坛 | `forum/` | [forum](./forum/index.md) | 服务端有；客户端可能未完整接 |
| 课程评价 / 给分 | `course_review/` | [course](./course/index.md) | 主路径 |
| 食堂 | `dining/` | [dining](./dining.md) | 主路径 |
| 搜索 | `search/` | [search](./search/index.md) · [indexing](./search/indexing.md) | PG FTS + 可选扩展（公开文档仅行为级） |
| 管理后台 | `admin/` | [admin](./admin.md) | 需 admin JWT |
| AI 助手 | `agent/` | — | AI 助手域：内部实现，公开文档不展开 |

## 校园域 `campus/`

| 能力 | 路径 | 文档 |
|------|------|------|
| 课表 | `campus/timetable` | [timetable](./timetable.md) |
| 日历 / ICS | `campus/calendar` | [calendar](./calendar.md) |
| 空闲教室 | `campus/classroom` | [classroom](./classroom.md) |
| 校巴等 | `campus/bus` 等 | [校园边界](./campus_proxies.md) |

**边界**：教务 / CAS / 馆 / 场馆等**个人武大会话**由 **App 直连**；服务端不收密码或 Cookie。详见 [campus_proxies](./campus_proxies.md)。

## 组件 `components/`

| 能力 | 路径 | 文档 |
|------|------|------|
| 学习资料 | `components/material` | [materials](./materials.md) |
| 通知 | `components/notification` | [notification](./notification.md) |

## 系统与平台

| 能力 | 路径 | 文档 | 状态 |
|------|------|------|------|
| 系统配置 / 更新 | `system/` | [system](./system.md) | 有；装包主路径见官网 |
| 官网 / 外部面 | `homepage/`（并列仓库） | [external_surfaces](./external_surfaces.md) | 非本进程 |
| 底座 | `internal/platform` | [platform](./platform/index.md) | 有 |
| 搜索 / 审核 / AI 等 | `services` 等 | [services](./services/index.md) | 有 |
| 天气 | — | [weather](./weather.md) | **无服务端模块**，App 直连 |
| 即时通讯 | — | [chat](./chat.md) | **未落地**（规划说明） |

## 路径约定

- 正确：`internal/domains/<name>/`  
- 错误：旧写法 `internal/forum`、`internal/course`（无 `_review`）等  

## 相关

- [服务端概览](../index.md)
- [校园边界](./campus_proxies.md)
- [基础设施](./platform/index.md)

