# 日历模块

日历模块提供了将课程时间表转换为日历文件的工具，以及管理用户手动创建的日历事件。

## 功能特性

1. **ICS 文件生成**: 将课程时间表数据转换为标准 iCalendar 格式，支持导入到常用日历应用。
2. **手动事件管理**: 允许用户创建个人事件，与课程表共存。
3. **导入集成**: 支持通过 curl 命令导入数据（为学校遗留系统提供兼容性支持）。

## 数据模型

### CalendarEvent（日历事件）
用于用户手动创建的事件。

```go
type CalendarEvent struct {
	ID          uint64    `gorm:"primaryKey" json:"id"`
	UserID      uint64    `gorm:"index" json:"user_id"`        // 所有者 ID
	Title       string    `json:"title"`                       // 事件标题
	Description string    `json:"description"`                 // 事件描述
	Location    string    `json:"location"`                    // 事件地点
	StartAt     time.Time `json:"start_at"`                    // 开始时间
	EndAt       time.Time `json:"end_at"`                      // 结束时间
	IsAllDay    bool      `json:"is_all_day"`                  // 是否全天事件
	CreatedAt   time.Time `json:"created_at"`                  // 创建时间
	UpdatedAt   time.Time `json:"updated_at"`                  // 更新时间
}
```

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
```
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
