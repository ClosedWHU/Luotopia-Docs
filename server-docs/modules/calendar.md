---
title: 校历与 ICS
sidebar_label: 校历与 ICS
sidebar_position: 8
---

代码：`internal/domains/campus/calendar`（`http/`：`calendar.go` CRUD、`calendar_feed.go` ICS 导出、`calendar_import.go` legacy 导入；`service/feed.go` 校历 feed）。

JSON 日历 API 以 OpenAPI / `httpapi` 为准。订阅用 ICS 下载：`GET /api/v1/calendar/export.ics`（Gin；可选鉴权；失败为 problem+json）。

## 功能特性

1. **ICS / Feed**: 校历 + 用户课表合成标准 iCalendar（`FeedService`）。
2. **手动事件管理**: 用户自建事件 CRUD。
3. **Legacy 导入**: 兼容校内遗留 curl 课表导入（`calendar_import.go`）。

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

### 生成 ICS 文件
**请求**: `POST /api/v1/calendar/generate`

根据已导入的课程数据和学期首个周日生成 ICS 格式的日历文件。

**请求体**:
```json
{
  "semester": "2024-2025-1",
  "include_manual_events": true
}
```

**响应**:
```json
{
  "ics_content": "BEGIN:VCALENDAR\nVERSION:2.0\n..."
}
```

### 列出用户事件
**请求**: `GET /api/v1/calendar/events`

返回认证用户的所有手动事件，支持按日期范围过滤。

**查询参数**:
```text
?start_date=2026-05-01&end_date=2026-05-31&limit=50
```

### 创建新事件
**请求**: `POST /api/v1/calendar/events`

为用户创建一个新的日历事件。

**请求体**:
```json
{
  "title": "项目报告会",
  "description": "小组项目进展报告",
  "location": "教室 202",
  "start_at": "2026-05-20T14:00:00Z",
  "end_at": "2026-05-20T16:00:00Z",
  "is_all_day": false
}
```

**响应**:
```json
{
  "id": 12345,
  "user_id": 1001,
  "title": "项目报告会",
  "created_at": "2026-05-13T10:30:00Z"
}
```

### 删除事件
**请求**: `DELETE /api/v1/calendar/events/{id}`

删除指定的日历事件。仅事件所有者可以删除。

---

## 使用场景

### 场景 1: 导出到 Apple Calendar
1. 用户在 Luotopia App 中点击"导出日历"
2. 系统生成 ICS 文件
3. 用户在邮件中点击 `.ics` 附件
4. 自动导入到 Apple Calendar

### 场景 2: 添加个人提醒事件
1. 期末考试前用户创建"考试准备"事件
2. 设置时间为考前一周
3. 日历应用推送提醒通知

---

## 最佳实践

- **时区处理**: 所有时间统一为 UTC，客户端负责时区转换
- **ICS 标准**: 严格遵循 RFC 5545 标准，确保兼容性
- **性能优化**: 大量事件查询时使用分页，默认每页 50 条

---

[返回模块列表](./index.md)
