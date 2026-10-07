---
title: 管理后台接口参考
sidebar_label: 管理后台
sidebar_position: 23
description: 管理后台相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> [!NOTE]
> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [管理后台模块](../modules/admin.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `DELETE` | `/api/v1/admin/api-credentials/{id}` | Delete API credential |
| `PUT` | `/api/v1/admin/api-credentials/{id}` | Update API credential |
| `POST` | `/api/v1/admin/cache/clear/all` | Clear all managed data cache |
| `POST` | `/api/v1/admin/cache/clear/batch` | Batch clear cache |
| `POST` | `/api/v1/admin/cache/clear/courses` | Clear course cache |
| `POST` | `/api/v1/admin/cache/clear/reviews` | Clear review cache |
| `POST` | `/api/v1/admin/cache/clear/search` | Clear search cache |
| `POST` | `/api/v1/admin/cache/clear/statistics` | Clear statistics cache |
| `POST` | `/api/v1/admin/cache/clear/teachers` | Clear teacher cache |
| `POST` | `/api/v1/admin/cache/clear/users` | Clear user cache |
| `POST` | `/api/v1/admin/cache/warmup` | Warm up cache |
| `GET` | `/api/v1/admin/cache/warmup/{task_id}` | Get warm up status |
| `GET` | `/api/v1/admin/cloud-control/flags` | List cloud control flags |
| `POST` | `/api/v1/admin/cloud-control/flags` | Create a cloud control flag |
| `GET` | `/api/v1/admin/cloud-control/flags/{key}` | Get one cloud control flag |
| `PATCH` | `/api/v1/admin/cloud-control/flags/{key}` | Update a cloud control flag |
| `GET` | `/api/v1/admin/cloud-control/flags/{key}/roles` | List the role rules of a cloud control flag |
| `DELETE` | `/api/v1/admin/cloud-control/flags/{key}/roles/{role}` | Delete the role rule of a cloud control flag |
| `PUT` | `/api/v1/admin/cloud-control/flags/{key}/roles/{role}` | Set the role rule of a cloud control flag |
| `GET` | `/api/v1/admin/cloud-control/flags/{key}/users` | List the user rules of a cloud control flag |
| `PUT` | `/api/v1/admin/cloud-control/flags/{key}/users` | Set a cloud control flag for a batch of users |
| `DELETE` | `/api/v1/admin/cloud-control/flags/{key}/users/{user_id}` | Delete one user's cloud control rule |
| `GET` | `/api/v1/admin/cloud-control/users/{user_id}/resolved` | Preview the effective cloud control values of one user |
| `GET` | `/api/v1/admin/course-external-mappings` | List campus course code mappings |
| `PUT` | `/api/v1/admin/course-external-mappings` | Create/update campus mapping and enqueue transcript remap |
| `DELETE` | `/api/v1/admin/course-external-mappings/{external_course_id}` | Delete a campus course mapping |
| `GET` | `/api/v1/admin/course-external-mappings/remap-jobs/{job_id}` | Get transcript remap job status |
| `GET` | `/api/v1/admin/course-external-mappings/unmapped` | List unmapped course codes from client transcript uploads |
| `POST` | `/api/v1/admin/courses` | Admin create course |
| `DELETE` | `/api/v1/admin/courses/{id}` | Admin delete course by ID |
| `GET` | `/api/v1/admin/courses/{id}` | Admin get course by ID |
| `PUT` | `/api/v1/admin/courses/{id}` | Admin update course by ID |
| `POST` | `/api/v1/admin/courses/batch-delete` | Admin batch delete courses |
| `POST` | `/api/v1/admin/embeddings/batch` | Batch create embeddings |
| `POST` | `/api/v1/admin/embeddings/course` | Create course embedding |
| `POST` | `/api/v1/admin/embeddings/index` | Create index task |
| `POST` | `/api/v1/admin/embeddings/review` | Create review embedding |
| `GET` | `/api/v1/admin/embeddings/status` | Get embedding status |
| `POST` | `/api/v1/admin/embeddings/teacher` | Create teacher embedding |
| `GET` | `/api/v1/admin/materials` | Admin search materials including deleted records |
| `DELETE` | `/api/v1/admin/materials/{material_uid}` | Admin delete material |
| `PUT` | `/api/v1/admin/materials/{material_uid}/approve` | Admin approve or reject material |
| `GET` | `/api/v1/admin/materials/{material_uid}/preview` | Preview a material for moderation |
| `PUT` | `/api/v1/admin/materials/{material_uid}/restore` | Admin restore material |
| `POST` | `/api/v1/admin/merge-course` | Merge two courses |
| `POST` | `/api/v1/admin/merge-teacher` | Merge two teachers |
| `GET` | `/api/v1/admin/push/deliveries` | List terminal push deliveries |
| `POST` | `/api/v1/admin/push/deliveries/{delivery_id}/retry` | Retry a terminal push delivery |
| `POST` | `/api/v1/admin/queue/clear` | Clear queue |
| `GET` | `/api/v1/admin/queue/failures` | List failed and dead-letter tasks |
| `DELETE` | `/api/v1/admin/queue/failures/{failure_id}` | Delete a failed-task entry |
| `GET` | `/api/v1/admin/queue/failures/{failure_id}` | Get a failed-task entry |
| `POST` | `/api/v1/admin/queue/failures/{failure_id}/replay` | Replay a failed task |
| `GET` | `/api/v1/admin/queue/metrics` | Get queue rate/latency metrics (503 until durable event-series instrumentation exists) |
| `POST` | `/api/v1/admin/queue/pause` | Pause queue |
| `POST` | `/api/v1/admin/queue/resume` | Resume queue |
| `POST` | `/api/v1/admin/queue/retry-failed` | Retry failed tasks |
| `GET` | `/api/v1/admin/queue/status` | Get queue status |
| `GET` | `/api/v1/admin/reviews` | Admin list reviews |
| `DELETE` | `/api/v1/admin/reviews/{id}` | Admin delete review |
| `PUT` | `/api/v1/admin/reviews/{id}` | Admin edit review |
| `PUT` | `/api/v1/admin/reviews/{id}/approve` | Admin approve review |
| `PUT` | `/api/v1/admin/reviews/{id}/reject` | Admin reject review |
| `GET` | `/api/v1/admin/reviews/audit/status` | Admin review audit status |
| `POST` | `/api/v1/admin/reviews/batch-approve` | Admin batch approve reviews |
| `POST` | `/api/v1/admin/reviews/batch-delete` | Admin batch delete reviews |
| `POST` | `/api/v1/admin/reviews/batch-reject` | Admin batch reject reviews |
| `GET` | `/api/v1/admin/reviews/pending` | Admin get pending reviews |
| `PUT` | `/api/v1/admin/roles/{role}/api-limits` | Update role API limits |
| `GET` | `/api/v1/admin/security/outbox` | List security outbox events |
| `POST` | `/api/v1/admin/security/outbox/{event_id}/replay` | Repair and replay a dead security outbox event |
| `GET` | `/api/v1/admin/stats/dashboard` | Dashboard stats (users, posts, comments with time series) |
| `GET` | `/api/v1/admin/storage/invalid` | List storage objects whose files are missing or deleted |
| `DELETE` | `/api/v1/admin/storage/invalid/{object_id}` | Purge one invalid storage object metadata record |
| `POST` | `/api/v1/admin/storage/invalid/purge` | Purge invalid storage object metadata records |
| `GET` | `/api/v1/admin/tasks` | List durable tasks |
| `GET` | `/api/v1/admin/tasks/{task_id}` | Get durable task tree |
| `POST` | `/api/v1/admin/tasks/cancel` | Cancel pending durable task |
| `GET` | `/api/v1/admin/tasks/capabilities` | Get admin task capabilities |
| `POST` | `/api/v1/admin/tasks/cleanup` | Cleanup tasks |
| `POST` | `/api/v1/admin/tasks/retry` | Retry task |
| `GET` | `/api/v1/admin/tasks/statistics` | Get task statistics |
| `GET` | `/api/v1/admin/teachers` | List teachers including deleted records |
| `POST` | `/api/v1/admin/teachers` | Create a new teacher (Admin) |
| `DELETE` | `/api/v1/admin/teachers/{id}` | Soft-delete a teacher |
| `PUT` | `/api/v1/admin/teachers/{id}/restore` | Restore a deleted teacher |
| `GET` | `/api/v1/admin/timetable/master/export` | Download the published master timetable snapshot for one semester |
| `GET` | `/api/v1/admin/timetable/master/import-jobs` | List master timetable import jobs |
| `DELETE` | `/api/v1/admin/timetable/master/import-jobs/{id}` | Delete a pending or failed master timetable import job |
| `POST` | `/api/v1/admin/timetable/master/import-jobs/{id}/retry` | Re-queue a failed master timetable import job |
| `GET` | `/api/v1/admin/users` | List users |
| `DELETE` | `/api/v1/admin/users/{id}` | Delete user |
| `GET` | `/api/v1/admin/users/{id}` | Get user |
| `PUT` | `/api/v1/admin/users/{id}` | Edit user |
| `GET` | `/api/v1/admin/users/{id}/credentials` | List user API credentials |
| `POST` | `/api/v1/admin/users/{id}/disable-2fa` | Force-disable a user's two-factor auth (TOTP + email 2FA + recovery codes) |
| `PUT` | `/api/v1/admin/users/{id}/limits` | Update user API limits |
| `GET` | `/api/v1/admin/users/{id}/login-history` | List a user's historical login audit events (IP + user agent) |
| `POST` | `/api/v1/admin/users/{id}/logout` | Revoke all of a user's sessions and refresh tokens (force logout) |
| `PUT` | `/api/v1/admin/users/{id}/nickname` | Update a user's forum nickname |
| `POST` | `/api/v1/admin/users/{id}/reset-avatar` | Reset a user's avatar to the generated default |
| `POST` | `/api/v1/admin/users/{id}/reset-bio` | Clear a user's self-filled bio |
| `POST` | `/api/v1/admin/users/{id}/reset-region` | Clear a user's self-filled region |
| `GET` | `/api/v1/admin/users/{id}/sessions` | List a user's active login sessions (device + IP) |
| `DELETE` | `/api/v1/admin/users/{id}/sessions/{sessionId}` | Revoke one of a user's login sessions |
| `POST` | `/api/v1/admin/users/batch` | Batch user operation |
| `POST` | `/api/v1/admin/users/disable` | Disable/Enable user |
| `POST` | `/api/v1/admin/users/role` | Set user role |
| `GET` | `/api/v1/admin/worker/status` | Get worker status |
| `GET` | `/api/v1/cache/stats` | Get cache statistics |
| `GET` | `/api/v1/cache/stats/detailed` | Get detailed cache statistics |
| `GET` | `/api/v1/cache/status` | Get cache status |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
