---
title: 课程与评价接口参考
sidebar_label: 课程与评价
sidebar_position: 12
description: 课程与评价相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> [!NOTE]
> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [课程与评价模块](../modules/course/index.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/course/grades/by-name` | Look up every Ham instructor score distribution for a course name (warms local course/teacher catalog; scores not stored) |
| `POST` | `/api/v1/course/grades/prepare/{course_uid}` | Search Ham and seed all teachers for a course |
| `POST` | `/api/v1/course/grades/resolve` | Resolve or seed a Ham-confirmed course and instructor pair |
| `GET` | `/api/v1/course/grades/teachers/{course_uid}` | Get course teachers grouped by teaching team |
| `GET` | `/api/v1/course/grades/view/{course_uid}` | Get merged grade view (own samples + optional Ham supplement) |
| `GET` | `/api/v1/courses` | Get all courses |
| `GET` | `/api/v1/courses/{course_uid}` | Get course by UID |
| `GET` | `/api/v1/courses/{course_uid}/reviews` | Get reviews by course UID |
| `GET` | `/api/v1/courses/{course_uid}/teachers` | Get teachers by course UID |
| `POST` | `/api/v1/courses/batch` | Get multiple courses by UIDs |
| `GET` | `/api/v1/courses/id/{id}` | Get course by internal ID |
| `POST` | `/api/v1/courses/teachers/batch` | Get teachers by multiple course UIDs |
| `GET` | `/api/v1/random/all` | Get random items (courses, teachers, reviews) |
| `GET` | `/api/v1/random/courses` | Get random courses |
| `GET` | `/api/v1/random/reviews` | Get random reviews |
| `GET` | `/api/v1/random/teachers` | Get random teachers |
| `GET` | `/api/v1/reviews` | Get all reviews |
| `POST` | `/api/v1/reviews` | Create a review |
| `DELETE` | `/api/v1/reviews/{review_uid}` | Delete the current user's review |
| `GET` | `/api/v1/reviews/{review_uid}` | Get review by UID |
| `PUT` | `/api/v1/reviews/{review_uid}` | Update the current user's review |
| `POST` | `/api/v1/reviews/{review_uid}/interact` | Like or dislike a review |
| `POST` | `/api/v1/reviews/{review_uid}/report` | Report a review |
| `POST` | `/api/v1/reviews/batch` | Get multiple reviews by UIDs |
| `GET` | `/api/v1/reviews/id/{id}` | Get review by ID |
| `GET` | `/api/v1/reviews/stats` | Get review stats |
| `POST` | `/api/v1/reviews/teachers/batch` | Get teachers by multiple review UIDs |
| `GET` | `/api/v1/teachers` | Get all teachers |
| `GET` | `/api/v1/teachers/{teacher_uid}` | Get teacher by UID |
| `GET` | `/api/v1/teachers/{teacher_uid}/courses` | Get courses by teacher UID |
| `POST` | `/api/v1/teachers/batch` | Get multiple teachers by UIDs |
| `POST` | `/api/v1/teachers/courses/batch` | Get courses by multiple teacher UIDs |
| `GET` | `/api/v1/teachers/id/{id}` | Get teacher by internal ID |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
