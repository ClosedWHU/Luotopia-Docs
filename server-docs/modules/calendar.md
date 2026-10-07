---
title: 校历与 ICS
sidebar_label: 校历与 ICS
sidebar_position: 8
---

代码：`internal/domains/campus/calendar`（`http/`：`calendar.go` CRUD、`calendar_feed.go` ICS 导出；`service/feed.go` 校历 feed）。

JSON 日历 API 以 OpenAPI / `httpapi` 为准。订阅用 ICS 下载：`GET /api/v1/calendar/export.ics`（Gin；可选鉴权；失败为 problem+json）。

## 能力范围

`FeedService` 把校历与用户课表合成标准 iCalendar，输出 ICS 文件与 feed 订阅链接；同时管理用户自建事件的 CRUD。

## 校历数据（内嵌）

校历学年数据由 `whucalendar.LoadAllYears()` 从 Go 依赖 `github.com/ClosedWHU/WHU-Calendar` 内嵌加载（`internal/domains/campus/calendar/service/feed.go`）。升级数据即升级依赖版本，无运行时配置、同步脚本或数据卷。

> [!NOTE]
> 旧数据卷方案（`server.calendar_data_dir` / `CALENDAR_DATA_DIR`）已移除，见 [已移除与迁移](../meta/removed_and_migrated.md)。

## 数据模型

### 用户事件（概念）

用户可创建手动日历事件。常见字段：标题、描述、地点、起止时间、是否全天。

校历主数据来自 `whucalendar` Go 包（见上文），与用户事件分离。

## API 接口

用户事件 CRUD、ICS 导出（`/export`、`/export.ics`）与校历 feed 的完整端点见[校园接口参考](../api/campus.md)。

### 创建事件请求体（摘要）

请求体为 JSON，字段名 camelCase：

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

## 导出到外部日历

用户在 Luotopia App 触发「导出日历」，服务端生成 ICS 内容或返回订阅链接。用户随后在外部日历应用（如 Apple Calendar）导入 `.ics` 文件，或直接订阅 feed。

## 时间与查询约定

- 时间统一使用 RFC3339 时间戳，客户端负责时区转换。
- ICS 输出遵循 RFC 5545。
- 查询与分页：事件查询按时间范围过滤，分页与上限见 OpenAPI。

## 相关

- [课程时间表](./timetable.md)
- [模块详解](./index.md)
- [已移除与迁移](../meta/removed_and_migrated.md)
