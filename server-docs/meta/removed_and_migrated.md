---
title: 已移除与迁移项
slug: removed-and-migrated
sidebar_label: 已移除与迁移
sidebar_position: 4
description: 服务端废弃协议与迁移说明的唯一汇总；主文档只写当前行为
---

本文是**弃用与迁移的唯一汇总**。主文档（架构、API、模块）只写当前行为；若需了解「曾经怎样 / 勿再使用什么」，查本文。

新代码与外部对接以「当前替代」及 [OpenAPI](../api/overview.md)、[HTTP 注册规范](../api/http_api.md) 为准。

## 全站请求 HMAC

| 旧做法 | 当前替代 |
|--------|----------|
| `X-Api-Sign` / `X-Api-Ts` 全站签名 | HTTPS + Bearer JWT / Session / 用户级 API 凭证 |

业务服不再校验全站请求 HMAC；不得要求移动端硬编码全局 `api_secret`。

## 独立 migrate 命令与全量 schema SQL

| 旧预期 | 当前方式 |
|--------|----------|
| 顶层 `migrate` 子命令 | 启动 `serve` / `worker` 触发 `database.InitDB()` / AutoMigrate |
| 仓库维护全量 schema SQL | 模型 + AutoMigrate；高风险重命名/删列由受控 SQL 处理 |

详见 [数据库迁移](../architecture/migrations.md)。

## 平台翻译服务

`internal/platform/translation` 与顶层 `translation` 配置不再存在。服务端错误文本以 handler / 错误中间件为准；客户端本地化由 Flutter l10n 负责。

## 尚未落地的 chat 域

当前无 `internal/domains/chat`，不要依赖 `/api/v1/chat/*` 或历史 WebSocket 私聊说明。状态页见 [即时通讯](../modules/chat.md)。

## 客户端成绩上传授资（transcript/sync）

| 旧做法 | 当前替代 |
|--------|----------|
| `POST /api/v1/user/transcript/sync`（客户端上传成绩行，`client_transcript` 源授评价资格） | `POST /api/v1/user/review-eligibility/sync`（服务端核验教务成绩后授资） |
| `POST /api/v1/course/grades/submit`、`GET /api/v1/course/grades/stats/{course_uid}` | `GET /api/v1/course/grades/view/{course_uid}` 及 resolve / prepare / teachers 端点 |

客户端上传的历史成绩行仅作为私有数据保留（legacy），不再授予评价 / 给分资格。当前说明见 [给分与统计](../modules/course/course_grades.md) 与 [课评身份与资格策略](../modules/forum/course_review_and_identity_policy.md)。

## 尚未落地的空闲教室实时推算

空闲教室数据为批量导入；「对接教务实时排课表做即时空闲推算」等说法未落地，不要依赖相关接口。当前说明见 [空闲教室查询](../modules/classroom.md)。

## 官网更新与热更新不属于 system 主路径

安装包更新与解析脚本热更新由官网 homepage 提供；`system` 域不作为 Flutter 主分发路径。见 [官网与外部面](../modules/external_surfaces.md)。

## HTTP 路由注册（huma → httpapi）

| 旧做法 | 当前替代 |
|--------|----------|
| 业务包直接 `huma.Register` + 手写 `Security` | **`httpapi.Register`**（`Access` + 可选 `Rate`） |
| 用 `anonymousOperations` 路径大表维护匿名接口 | 注册时 **`Access: Public`**；运行时 Access 表为空则 `/api/v1/*` 默认需登录 |
| Gin 内存全局限流作为主手段 | 操作级 `Rate` 配额 + 默认 IP 配额兜底（数值与机制以部署配置为准） |
| Forum Huma Group + 包内鉴权中间件为主 | 完整 path 的 `httpapi.Register` + 全局鉴权/限流（`EnsureDefaults` 仍可用中间件钩子） |

当前规范正文：[HTTP 注册规范](../api/http_api.md)、仓库 `server/docs/api-conventions.md`。

## 校历数据卷与 calendar_data_dir（2026-08 移除）

| 旧做法 | 当前替代 |
|--------|----------|
| 校历学年 JSON 以只读数据卷挂载（`server.calendar_data_dir` / `CALENDAR_DATA_DIR` / `SCHOOL_CALENDAR_DATA_HOST`） | Go 依赖 `github.com/ClosedWHU/WHU-Calendar`（`whucalendar.LoadAllYears()`）内嵌数据 |
| `scripts/sync-calendar-data.ps1` 同步并列仓 WHU-sb-Calendar | 升级依赖版本即升级数据 |

需从配置文件与 Compose 编排中删除上述配置键、环境变量与数据卷挂载。保留 `calendar_data_dir` 会触发未知字段校验，导致启动失败。当前说明见 [日历模块](../modules/calendar.md) 与 [配置手册](../deployment/config.md)。

## 通知 OpenAPI OperationID

通知域 **OperationID** 由 camelCase 改为 kebab（**HTTP 路径未变**）：

| 旧 OperationID | 当前 OperationID |
|----------------|------------------|
| `listNotifications` | `notification-list` |
| `getUnreadCount` | `notification-unread-count` |
| `markAsRead` | `notification-mark-read` |
| `markAllAsRead` | `notification-mark-all-read` |
| `deleteNotification` | `notification-delete` |

仅影响 OpenAPI `operationId` 与限流注册键；客户端若按 operationId 生成代码需同步。

## 相关

- [安全策略](../architecture/security_policy.md)（当前模型）
- [HTTP 注册规范](../api/http_api.md)（当前写法）
- [公开文档边界](./public_docs_policy.md)
