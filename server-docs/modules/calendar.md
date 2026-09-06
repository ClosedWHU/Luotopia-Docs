---
title: 校历与 ICS
sidebar_label: 校历与 ICS
sidebar_position: 8
---

代码：`internal/domains/campus/calendar`（`http/`：`calendar.go` CRUD、`calendar_feed.go` ICS 导出、`calendar_import.go` legacy 导入；`service/feed.go` 校历 feed）。

JSON 日历 API 以 OpenAPI / `httpapi` 为准。订阅用 ICS 下载：`GET /api/v1/calendar/export.ics`（Gin；可选鉴权；失败为 problem+json）。

## 功能特性

| 能力 | 说明 |
|------|------|
| ICS / Feed | 校历 + 用户课表合成标准 iCalendar（`FeedService`） |
| 手动事件管理 | 用户自建事件 CRUD |
| Legacy 导入 | 兼容校内遗留 curl 课表导入（`calendar_import.go`） |

## 校历数据（内嵌）

校历学年数据由 `whucalendar.LoadAllYears()` 从 Go 依赖 `github.com/ClosedWHU/WHU-Calendar` 内嵌加载（`internal/domains/campus/calendar/service/feed.go`）。升级数据即升级依赖版本，无运行时配置、同步脚本或数据卷。

> [!NOTE]
> 旧数据卷方案（`server.calendar_data_dir` / `CALENDAR_DATA_DIR`）已移除，见 [已移除与迁移](../meta/removed_and_migrated.md)。

## 数据模型

### 用户事件（概念）

用户可创建手动日历事件。常见字段：标题、描述、地点、起止时间、是否全天。
**字段名与类型以 OpenAPI 为准。**

校历主数据来自 `whucalendar` Go 包（见上文），与用户事件分离。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/calendar/export` | 导出 ICS 日历 feed |
| GET | `/api/v1/calendar/export.ics` | 订阅用 ICS 下载（Gin；可选鉴权） |
| GET | `/api/v1/calendar/events` | 列出用户事件（按 `start_at` / `end_at` 范围过滤） |
| POST | `/api/v1/calendar/events` | 创建用户事件 |
| DELETE | `/api/v1/calendar/events/{id}` | 删除指定事件（仅事件所有者） |

### 创建事件请求体（摘要）

字段名以 OpenAPI 为准（JSON 为 camelCase）：

```json
{
  "title": "项目报告会",
  "description": "小组项目进展报告",
  "location": "教室 202",
  "startAt": "2026-05-20T14:00:00Z",
  "endAt": "2026-05-20T16:00:00Z",
  "isAllDay": false,
  "category": "study"
}
```

## 使用场景

### 导出到外部日历

1. 用户在 Luotopia App 中触发「导出日历」。
2. 系统生成 ICS 内容或提供订阅链接。
3. 用户在外部日历应用（如 Apple Calendar）中导入 `.ics` 或订阅 feed。

## 最佳实践

- **时区处理**：时间统一使用 RFC3339 时间戳，客户端负责时区转换。
- **ICS 标准**：严格遵循 RFC 5545 标准，确保兼容性。
- **性能优化**：事件查询按时间范围过滤；分页与上限以 OpenAPI 为准。

## 相关

- [课程时间表](./timetable.md)
- [模块详解](./index.md)
- [已移除与迁移](../meta/removed_and_migrated.md)
