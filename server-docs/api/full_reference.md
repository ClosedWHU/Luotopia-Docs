---
title: 接口参考索引
slug: full-reference
sidebar_label: 接口参考索引
sidebar_position: 4
---

> [!NOTE]
> **权威来源**：运行中服务导出的 OpenAPI（`/openapi.json` 或 `/docs`）。本页为索引，按域拆分的完整端点列表见下列各页；字段类型、枚举、错误体以 OpenAPI 为准。
>
> 认证：`Authorization: Bearer`；`/api/v1` 默认需登录（声明 `AccessPublic` 的除外）。无全站 `X-Api-Sign`。安装包更新 / 热更新 **不在** 本 API 主路径，见 [官网与外部面](../modules/external_surfaces.md)。

## 按域参考

| 域 | 端点参考 | 模块说明 |
|------|---------|---------|
| 身份认证（User / Identity / OIDC / Verification） | [identity](./identity.md) | [模块](../modules/identity/index.md) |
| 论坛 | [forum](./forum.md) | [模块](../modules/forum/index.md) |
| 课程与评价（Courses / Reviews / Teachers / Course / Random） | [course](./course.md) | [模块](../modules/course/index.md) |
| 课程信息共享（CourseSpace） | [course-space](./course-space.md) | [模块](../modules/course_space.md) |
| 社交与私信 | [social](./social.md) | [模块](../modules/social.md) |
| 食堂 | [dining](./dining.md) | [模块](../modules/dining.md) |
| 站内通知 | [notification](./notification.md) | [模块](../modules/notification.md) |
| 学习资料 | [material](./material.md) | [模块](../modules/materials.md) |
| 统一搜索 | [search](./search.md) | [模块](../modules/search/index.md) |
| 校园（课表 / 日历 / 教室 / 校巴） | [campus](./campus.md) | [模块](../modules/timetable.md) |
| 系统与公共接口 | [system](./system.md) | [模块](../modules/system.md) |
| 云控 | [cloud-control](./cloud-control.md) | [模块](../modules/cloudcontrol.md) |
| AI 助手 | [agent](./agent.md) | [模块](../modules/agent.md) |
| 管理后台（Admin / Cache） | [admin](./admin.md) | [模块](../modules/admin.md) |

## 相关

- [错误码](./error_codes.md)（错误语义的唯一来源）
- [API 使用指南](./overview.md)
- [HTTP 注册规范](./http_api.md)
- [API 调用规范](./detailed_reference.md)
