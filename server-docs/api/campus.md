---
title: 校园（课表/日历/教室/校巴）接口参考
sidebar_label: 校园
sidebar_position: 19
description: 校园（课表/日历/教室/校巴）相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> [!NOTE]
> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [校园（课表/日历/教室/校巴）模块](../modules/timetable.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/calendar/events` | List calendar events |
| `POST` | `/api/v1/calendar/events` | Create calendar event |
| `DELETE` | `/api/v1/calendar/events/{id}` | Delete calendar event |
| `GET` | `/api/v1/calendar/export` | Export ICS calendar feed |
| `GET` | `/api/v1/campus/bus/lines/{line_id}` | Get WHU bus line stops and vehicles |
| `GET` | `/api/v1/campus/bus/lines/{line_id}/vehicles` | Get real-time WHU bus positions |
| `GET` | `/api/v1/classrooms/empty` | Search for empty classrooms |
| `GET` | `/api/v1/timetable` | List timetable entries |
| `POST` | `/api/v1/timetable` | Create a timetable entry |
| `DELETE` | `/api/v1/timetable/{id}` | Delete a timetable entry |
| `PUT` | `/api/v1/timetable/{id}` | Update a timetable entry |
| `GET` | `/api/v1/timetable/master` | Get university-wide master schedule for one semester |
| `GET` | `/api/v1/timetable/master/history` | Find course offerings across all published semesters |
| `POST` | `/api/v1/timetable/master/import-jobs` | Contribute a master timetable import |
| `GET` | `/api/v1/timetable/master/import-jobs/{id}` | Get master timetable import progress |
| `GET` | `/api/v1/timetable/master/periods` | List periods with published master timetable data |
| `GET` | `/api/v1/timetable/master/search` | Search the master schedule with filters for one semester |
| `GET` | `/api/v1/timetable/master/suggestions` | Suggest master schedule courses for one semester |
| `GET` | `/api/v1/user/sync/timetable` | Download multi-timetable cloud snapshot |
| `PUT` | `/api/v1/user/sync/timetable` | Upload multi-timetable cloud snapshot (requires sync.timetable consent) |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
