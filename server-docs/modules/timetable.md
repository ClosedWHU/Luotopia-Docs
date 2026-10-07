---
title: 课程时间表
sidebar_label: 课程时间表
sidebar_position: 7
---

代码：`internal/domains/campus/timetable`。用户可手动录入课程日程，也可从外部系统（如教务系统）导入。

**字段与完整路径以 OpenAPI 为准**；本文只做能力级摘要，不复制 schema。

## 数据模型

核心概念是时间表条目，即用户的一节课安排：

| 概念 | 说明 |
|------|------|
| 星期 / 节次 / 周次 | 上课时间表达（`dayOfWeek` 1-7、`startSection` / `endSection` 1-13、`weeks` 字符串） |
| 学年学期 | `year` 与 `semester` |
| 课程 / 教师 / 地点 | `courseName`、`teacherName`、`place` 等展示信息 |
| 可选 course 关联 | `courseId`，与课程主数据关联时使用 |

## API 接口

个人时间表条目 CRUD 与主数据接口（`/master/periods`、`/master/search`、`/master/suggestions`、`/master/history`、`/master/import-jobs`），完整端点见[校园接口参考](../api/campus.md)。

**个人教务课表导入由 App 完成**，服务端不代持武大密码去爬教务。主课表贡献（`POST /api/v1/timetable/master/import-jobs`）接受一次性 CAS `ticket` 核验。管理端 `GET/POST /api/v1/admin/timetable/master/import-jobs`（含 `{id}/retry`、删除）与 `GET /api/v1/admin/timetable/master/export` 用于主课表运维，见 [管理后台接口参考](../api/admin.md)。

## 性能与实现注意

| 方向 | 说明 |
|------|------|
| 查询 | 按用户 + 学年 / 学期过滤 |
| 索引 / 缓存 | 由实现维护；key 与 TTL 非公开契约 |
| 导入边界 | 主课表贡献经一次性 CAS 票据核验（见上） |

## 相关

- [模块详解](./index.md)
- [校历与 ICS](./calendar.md)
- [校园边界](./campus_proxies.md)
