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
| 课程信息共享 | `course_space/` | [course_space](./course_space.md) | 教学班共享 + 信任模型；云控放量 |
| 社交与私信 | `social/` | [social](./social.md) | 关注 / 拉黑 / 私信 |
| 食堂 | `dining/` | [dining](./dining.md) | 主路径 |
| 搜索 | `search/` | [search](./search/index.md) · [indexing](./search/indexing.md) | PG FTS + 可选扩展（公开文档仅行为级） |
| 管理后台 | `admin/` | [admin](./admin.md) | 需 admin JWT |
| 云控 | `cloudcontrol/` | [cloudcontrol](./cloudcontrol.md) | 子应用 / 功能开关与参数下发 |
| AI 助手 | `agent/` | [agent](./agent.md) | 带工具调用的 LLM 循环 |

## 校园域 `campus/`

| 能力 | 路径 | 文档 |
|------|------|------|
| 课表 | `campus/timetable` | [timetable](./timetable.md) |
| 日历 / ICS | `campus/calendar` | [calendar](./calendar.md) |
| 空闲教室 | `campus/classroom` | [classroom](./classroom.md) |
| 校巴等 | `campus/bus` 等 | [校园边界](./campus_proxies.md) |
| CAS 客户端（薄） | `campus/cas` | [校园边界](./campus_proxies.md) |

**边界**：教务 / CAS / 馆 / 场馆等**个人武大会话**由 **App 直连**；服务端不保存密码或 Cookie，仅瞬时核验一次性 CAS 票据（注册授权 / 评价资格 / 主课表贡献）。`campus/cas` 为薄 WHU CAS 客户端；实际票据核验在 `course_review/client/jwgl.go` 与 timetable 侧。详见 [campus_proxies](./campus_proxies.md)。

## 资料 / 通知

| 能力 | 路径 | 文档 |
|------|------|------|
| 学习资料 | `material/` | [materials](./materials.md) |
| 站内通知 | `notification/` | [notification](./notification.md) |

## 系统与平台

| 能力 | 路径 | 文档 | 状态 |
|------|------|------|------|
| 系统配置 / 更新 | `system/` | [system](./system.md) | 有；装包主路径见官网 |
| 官网 / 外部面 | `homepage/`（并列仓库） | [external_surfaces](./external_surfaces.md) | 非本进程 |
| 底座 | `internal/platform` | [platform](./platform/index.md) | 有 |
| 进程内服务 | `internal/services` | [services](./services/index.md) | 有（AI / worker） |
| 天气 | — | [weather](./weather.md) | **无服务端模块**，App 直连 |

## 路径约定

- 正确：`internal/domains/<name>/`  
- 错误：旧写法 `internal/forum`、`internal/course`（无 `_review`）、`internal/domains/components/*`（资料与通知是顶层域）等  

## 相关

- [服务端概览](../index.md)
- [校园边界](./campus_proxies.md)
- [基础设施](./platform/index.md)
