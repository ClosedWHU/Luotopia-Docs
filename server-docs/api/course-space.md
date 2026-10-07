---
title: 课程信息共享接口参考
sidebar_label: 课程信息共享
sidebar_position: 13
description: 课程信息共享相关端点索引（字段与完整路径以 OpenAPI 为准）
slug: course-space
---

> [!NOTE]
> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [课程信息共享模块](../modules/course_space.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/v1/admin/course-audit-logs` | List one teaching class audit trail |
| `POST` | `/api/v1/admin/course-heads` | Register a teaching offering with an explicit canonical key |
| `POST` | `/api/v1/admin/course-heads/{id}/archive` | Stop teaching-offering aggregation while retaining its audit history |
| `GET` | `/api/v1/admin/course-heads/{id}/audit-logs` | List one course head audit trail |
| `PATCH` | `/api/v1/admin/course-heads/{id}/metadata` | Correct teaching offering display metadata |
| `GET` | `/api/v1/admin/course-projection-failures` | List dead course projection jobs |
| `GET` | `/api/v1/admin/course-projection-failures/{id}/preview` | Preview current-state course projection changes without committing |
| `POST` | `/api/v1/admin/course-projection-failures/{id}/retry` | Retry a dead course projection against current source |
| `POST` | `/api/v1/admin/course-projection-failures/preview-batch` | Preview multiple dead course projections without committing |
| `POST` | `/api/v1/admin/course-projection-failures/retry-batch` | Retry multiple dead course projections atomically |
| `GET` | `/api/v1/admin/course-reports` | Review course information reports |
| `POST` | `/api/v1/admin/course-reports/{id}/assign` | Assign a course report reviewer |
| `POST` | `/api/v1/admin/course-reports/{id}/author-appeal/resolve` | Independently decide an information author's appeal |
| `POST` | `/api/v1/admin/course-reports/{id}/resolve` | Resolve or independently review a course report |
| `GET` | `/api/v1/admin/course-role-applications` | List course role applications for review |
| `POST` | `/api/v1/admin/course-role-applications/{id}/decisions` | decide role |
| `POST` | `/api/v1/admin/course-role-grants/{id}/revoke` | Revoke a class-scoped assistant or representative grant |
| `POST` | `/api/v1/admin/course-spaces` | create space |
| `GET` | `/api/v1/admin/course-spaces/{space_id}/access` | List class members and active scoped grants |
| `POST` | `/api/v1/admin/course-spaces/{space_id}/archive` | Archive one teaching class and pause source calendar following |
| `PUT` | `/api/v1/admin/course-spaces/{space_id}/head` | Confirm or remove a teaching-class head association |
| `GET` | `/api/v1/admin/course-spaces/{space_id}/master-schedule-candidates` | Review published master timetable rows for an exact class and term |
| `POST` | `/api/v1/admin/course-spaces/{space_id}/master-sessions/import` | Reconcile dated class sessions from one published master revision |
| `PUT` | `/api/v1/admin/course-spaces/{space_id}/members/{user_id}/restriction` | Restrict or restore shared writes for a class member |
| `POST` | `/api/v1/admin/course-spaces/{space_id}/members/{user_id}/revoke` | Revoke course membership and private calendar access |
| `PATCH` | `/api/v1/admin/course-spaces/{space_id}/metadata` | Correct class registry metadata without changing its identity |
| `POST` | `/api/v1/admin/course-spaces/{space_id}/restore` | Restore an archived class with a future end time |
| `GET` | `/api/v1/admin/course-spaces/{space_id}/rollout` | Read teaching-class rollout status |
| `PUT` | `/api/v1/admin/course-spaces/{space_id}/rollout` | Change teaching-class rollout status |
| `GET` | `/api/v1/admin/course-spaces/{space_id}/sessions` | List registered class occurrences |
| `PUT` | `/api/v1/admin/course-spaces/{space_id}/sessions` | Register or reschedule a class occurrence |
| `GET` | `/api/v1/admin/course-trust-reviews` | List accepted course revisions requiring trust revalidation |
| `DELETE` | `/api/v1/course-discussion-links/{id}` | Remove a course forum discussion link |
| `GET` | `/api/v1/course-event-bindings/{id}` | get binding |
| `POST` | `/api/v1/course-event-bindings/{id}/detach` | detach binding |
| `PATCH` | `/api/v1/course-event-bindings/{id}/preferences` | update personal |
| `POST` | `/api/v1/course-event-bindings/{id}/retry` | retry binding |
| `PUT` | `/api/v1/course-events/{id}/calendar-binding` | bind event |
| `GET` | `/api/v1/course-heads` | Find explicitly registered teaching offerings |
| `GET` | `/api/v1/course-heads/{head_id}/spaces` | List class metadata without inheriting membership permissions |
| `GET` | `/api/v1/course-invitation-preference` | Get post-class invitation preference |
| `PUT` | `/api/v1/course-invitation-preference` | Enable or disable post-class invitations |
| `PUT` | `/api/v1/course-invitation-push-preference` | Configure opt-in push and quiet hours for teaching-class invitations |
| `GET` | `/api/v1/course-items/{id}` | Get course information and version trust |
| `GET` | `/api/v1/course-items/{id}/discussion-links` | List linked discussions for a course item |
| `POST` | `/api/v1/course-items/{id}/discussion-links` | Link a course forum post to an information item |
| `POST` | `/api/v1/course-items/{id}/report-evidence` | Upload private course report evidence |
| `POST` | `/api/v1/course-items/{id}/reports` | Report a course information revision |
| `GET` | `/api/v1/course-items/{id}/revisions` | Get course information revisions |
| `POST` | `/api/v1/course-items/{id}/revisions` | revise item |
| `GET` | `/api/v1/course-items/{id}/revisions/{revision_id}` | Get a course information revision |
| `POST` | `/api/v1/course-items/{id}/withdraw` | withdraw |
| `POST` | `/api/v1/course-reports/{id}/appeal-evidence` | Upload private course appeal evidence |
| `POST` | `/api/v1/course-reports/{id}/appeals` | Appeal own course report decision |
| `POST` | `/api/v1/course-reports/{id}/author-appeal-evidence` | Upload private evidence for an information author's appeal |
| `POST` | `/api/v1/course-reports/{id}/author-appeals` | Appeal withdrawal of own course information |
| `GET` | `/api/v1/course-reports/{id}/evidence/{purpose}` | List own or reviewer course report evidence |
| `GET` | `/api/v1/course-reports/{id}/evidence/{purpose}/{evidence_id}` | Download private course report evidence |
| `POST` | `/api/v1/course-revisions/{id}/attestations` | attest |
| `PUT` | `/api/v1/course-revisions/{id}/vote` | vote |
| `POST` | `/api/v1/course-role-applications/{id}/cancel` | Cancel a pending course role application |
| `GET` | `/api/v1/course-role-applications/{id}/evidence` | List private role application evidence |
| `GET` | `/api/v1/course-role-applications/{id}/evidence/{evidence_id}` | Download private role application evidence |
| `GET` | `/api/v1/course-spaces` | Search teaching-class spaces |
| `GET` | `/api/v1/course-spaces/{space_id}` | Get course space and current membership |
| `GET` | `/api/v1/course-spaces/{space_id}/events` | List visible course events |
| `GET` | `/api/v1/course-spaces/{space_id}/head` | Read the registered teaching offering for a class |
| `PUT` | `/api/v1/course-spaces/{space_id}/home-seen` | Acknowledge a visible course information change |
| `GET` | `/api/v1/course-spaces/{space_id}/invitation-preference` | Get teaching-class invitation preference |
| `PUT` | `/api/v1/course-spaces/{space_id}/invitation-preference` | Enable or disable invitations for one teaching class |
| `GET` | `/api/v1/course-spaces/{space_id}/invitations` | Get post-class contribution invitations |
| `POST` | `/api/v1/course-spaces/{space_id}/invitations/{invite_id}/skip` | Skip a post-class invitation |
| `GET` | `/api/v1/course-spaces/{space_id}/items` | List accessible course information |
| `POST` | `/api/v1/course-spaces/{space_id}/items` | create item |
| `PUT` | `/api/v1/course-spaces/{space_id}/membership` | membership |
| `POST` | `/api/v1/course-spaces/{space_id}/role-applications` | apply role |
| `POST` | `/api/v1/course-spaces/{space_id}/role-evidence` | Upload private course role evidence |
| `GET` | `/api/v1/course-spaces/{space_id}/sessions` | List teaching class occurrences for enrolled readers |
| `GET` | `/api/v1/course-spaces/{space_id}/subscription` | get subscription |
| `PUT` | `/api/v1/course-spaces/{space_id}/subscription` | update subscription |
| `GET` | `/api/v1/forum/posts/{id}/course-links` | List accessible versioned course information cited by a forum post |
| `GET` | `/api/v1/user/course-author-reports` | List withdrawn authored information and independent appeals |
| `GET` | `/api/v1/user/course-calendar-changes` | calendar changes |
| `GET` | `/api/v1/user/course-case-notices` | List private course review results |
| `PUT` | `/api/v1/user/course-case-notices/{id}/read` | Mark own course review result read |
| `GET` | `/api/v1/user/course-event-change-notice-preference` | Read course calendar change notice preference |
| `PUT` | `/api/v1/user/course-event-change-notice-preference` | Enable or disable future course calendar change notices |
| `GET` | `/api/v1/user/course-home-summary` | Batch home summaries for joined courses |
| `GET` | `/api/v1/user/course-reports` | List own course reports, including after class access ends |
| `GET` | `/api/v1/user/course-role-applications` | List own course role applications |
| `GET` | `/api/v1/user/course-spaces` | List joined course spaces |
| `GET` | `/api/v1/user/course-timetable-links/{key}` | Resolve a confirmed private timetable link |
| `PUT` | `/api/v1/user/course-timetable-links/{key}` | Confirm or unlink a private teaching-class association |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
