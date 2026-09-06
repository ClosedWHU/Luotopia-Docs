---
title: 课程时间表
sidebar_label: 课程时间表
sidebar_position: 7
---

代码：`internal/domains/campus/timetable`。课程时间表模块支持用户管理个人课程日程，包括从外部系统（如教务系统）导入与手动录入。

**字段与完整路径以 OpenAPI 为准**；本文只做能力级摘要，不复制 schema。

## 数据模型

核心概念是**时间表条目**（用户的一节课安排）。字段以 OpenAPI / 模型为准，概念包括：

| 概念 | 说明 |
|------|------|
| 星期 / 节次 / 周次 | 上课时间表达（`dayOfWeek` 1-7、`startSection` / `endSection` 1-13、`weeks` 字符串；校验以 OpenAPI 为准） |
| 学年学期 | `year` 与 `semester` |
| 课程 / 教师 / 地点 | `courseName`、`teacherName`、`place` 等展示信息 |
| 可选 course 关联 | `courseId`，与课程主数据关联时使用 |

## API 接口

另有 `GET /api/v1/timetable/master` 等主数据接口（`/master/periods`、`/master/search`、`/master/suggestions`、`/master/import-jobs`，以 OpenAPI 为准）。
**个人教务课表导入由 App 完成**，服务端不代持武大密码去爬教务。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/timetable` | 返回认证用户的时间表条目（可按 `year` / `semester` 过滤） |
| POST | `/api/v1/timetable` | 创建时间表条目 |
| PUT | `/api/v1/timetable/{id}` | 更新指定条目 |
| DELETE | `/api/v1/timetable/{id}` | 删除指定条目（仅所有者） |

请求体与响应字段以 OpenAPI 为准。

## 性能与实现注意

| 方向 | 说明 |
|------|------|
| 查询 | 按用户 + 学年 / 学期过滤；分页与过滤参数以 OpenAPI 为准 |
| 索引 / 缓存 | 由实现维护；key 与 TTL 非公开契约 |
| 导入边界 | **个人教务课表由 App 导入**；服务端不代持武大密码爬教务 |
| 字段权威 | 示例若与 OpenAPI 冲突，以 OpenAPI / 模型为准 |

## 相关

- [模块详解](./index.md)
- [校历与 ICS](./calendar.md)
- [校园边界](./campus_proxies.md)
