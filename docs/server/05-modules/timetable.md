# 课程时间表模块

课程时间表模块允许用户管理他们的课程日程，包括从外部系统（如教务系统）导入数据和手动录入。

## 数据模型

核心数据结构是 `TimetableEntry`（时间表条目）：

```go
type TimetableEntry struct {
	ID        uint64 `gorm:"primaryKey" json:"id"`
	UserID    uint64 `gorm:"index" json:"user_id"`            // 用户 ID
	CourseID  uint64 `gorm:"index" json:"course_id"`          // 关联课程 ID
	Title     string `json:"title"`                           // 课程名称
	Teacher   string `json:"teacher"`                         // 教师名字
	Location  string `json:"location"`                        // 上课地点
	Day       int    `json:"day"`                             // 周几 (1-7 周一至周日)
	Sections  string `json:"sections"`                        // 节次 (如 "1-2" 表示第 1-2 节)
	Weeks     string `json:"weeks"`                           // 周数范围 (如 "1-16" 表示第 1-16 周)
	Semester  string `json:"semester"`                        // 学期代码 (如 "2024-2025-1")
	CreatedAt time.Time `json:"created_at"`                   // 创建时间
	UpdatedAt time.Time `json:"updated_at"`                   // 更新时间
}
```

### 字段说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| Day | int | 星期几，1 = 周一，7 = 周日 | 3 (周三) |
| Sections | string | 课程所占课时，用"-"表示范围 | "1-2" = 第 1、2 节课 |
| Weeks | string | 课程跨越的周数，支持","和"-"组合 | "1-8,10-16" = 第 1-8 周和 10-16 周 |
| Semester | string | 学年学期代码 | "2024-2025-1" = 2024-2025 学年第 1 学期 |

## API 接口

### 查询课程时间表
**请求**: `GET /api/v1/timetable`

返回认证用户的所有时间表条目，支持按学期过滤。

**查询参数**:
```
?semester=2024-2025-1&limit=50&offset=0
```

**响应示例**:
```json
{
  "total": 15,
  "items": [
    {
      "id": 1001,
      "user_id": 5001,
      "course_id": 200001,
      "title": "数据结构",
      "teacher": "张教授",
      "location": "教室 A101",
      "day": 2,
      "sections": "1-2",
      "weeks": "1-16",
      "semester": "2024-2025-1",
      "created_at": "2024-09-01T00:00:00Z"
    }
  ]
}
```

### 创建或更新时间表条目
**请求**: `POST /api/v1/timetable`

为用户创建新的课程时间表条目，或更新已存在的条目。

**请求体**:
```json
{
  "course_id": 200001,
  "title": "数据结构",
  "teacher": "张教授",
  "location": "教室 A101",
  "day": 2,
  "sections": "3-4",
  "weeks": "1-16",
  "semester": "2024-2025-1"
}
```

**响应**:
```json
{
  "id": 1001,
  "user_id": 5001,
  "course_id": 200001,
  "title": "数据结构",
  "teacher": "张教授",
  "location": "教室 A101",
  "day": 2,
  "sections": "3-4",
  "weeks": "1-16",
  "semester": "2024-2025-1",
  "created_at": "2024-09-01T10:30:00Z"
}
```

### 批量导入时间表
**请求**: `POST /api/v1/timetable/batch`

批量导入多个时间表条目，通常在从教务系统解析课程数据后使用。

**请求体**:
```json
{
  "semester": "2024-2025-1",
  "entries": [
    {
      "course_id": 200001,
      "title": "数据结构",
      "teacher": "张教授",
      "location": "教室 A101",
      "day": 2,
      "sections": "1-2",
      "weeks": "1-16"
    },
    {
      "course_id": 200002,
      "title": "数据库原理",
      "teacher": "李教授",
      "location": "教室 B202",
      "day": 4,
      "sections": "3-4",
      "weeks": "1-16"
    }
  ]
}
```

**响应**:
```json
{
  "success_count": 2,
  "failed_count": 0,
  "created_ids": [1001, 1002]
}
```

### 删除时间表条目
**请求**: `DELETE /api/v1/timetable/{id}`

删除指定的课程时间表条目。仅条目所有者可以删除。

**响应**:
```json
{
  "message": "删除成功"
}
```

---

## 常见使用场景

### 场景 1: 学期初导入课程表
1. 学生在教务系统导出课程表（通常为 Excel）
2. 通过解析工具转换为结构化数据
3. 调用批量导入接口一次性插入所有课程
4. 应用自动展示本周课程

### 场景 2: 手动调整课程时间
1. 教师临时调整某节课的时间地点
2. 学生手动修改对应的时间表条目
3. 系统自动通知订阅了该课程的学生

### 场景 3: 跨学期导出
1. 用户在日历应用中导出整学年的课程日程
2. 系统汇总所有学期的时间表条目
3. 生成 ICS 文件供外部日历导入

---

## 性能优化建议

| 优化项 | 说明 | 示例 |
|--------|------|------|
| 索引 | 在 `user_id` + `semester` 上建组合索引 | `CREATE INDEX idx_user_semester ON timetable(user_id, semester)` |
| 缓存 | 对单个学期的课程表进行 Redis 缓存（TTL 1 天） | Cache key: `timetable:user:{id}:semester:{code}` |
| 分页 | 大量课程时使用分页查询，默认 50 条/页 | 参数：`limit=50&offset=0` |
| 软删除 | 记录删除时间，保留历史数据用于审计 | 添加 `deleted_at` 字段 |

---

[返回模块列表](./index.md)
