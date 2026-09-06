---
title: API 调用规范
sidebar_label: 调用规范
slug: detailed-reference
sidebar_position: 3
---

> **权威来源**：运行中服务的 OpenAPI（`/openapi.json`）。本文为常用调用**规范与示例**，字段与路径冲突时以 OpenAPI / 代码为准。
> 不在此文档中复制完整 schema；新增接口请改 OpenAPI 生成物，而非只改本文。

本文说明核心调用形态与示例请求体，帮助客户端对接。端点索引见 [API 接口参考（摘要）](./full_reference.md)。

## 认证

认证方式（JWT / 用户 API 凭证 / Web 会话）统一见 [API 使用指南 · 认证](./overview.md#认证)；默认鉴权规则见 [安全策略](../architecture/security_policy.md)。全站请求 HMAC 的迁移说明见 [已移除与迁移](../meta/removed_and_migrated.md#全站请求-hmac)。

## 课程评价调用

### 提交评价 `POST /api/v1/reviews`

支持用户对课程进行多维度评分，需携带 `Authorization`，且要求已具备评价资格（见 [课评身份与资格策略](../modules/forum/course_review_and_identity_policy.md)）。

**请求体**（字段全集以 OpenAPI 为准）：

```json
{
  "course_uid": "CS101-WHU",
  "title": "课程作业量适中",
  "content": "老师讲得很细……",
  "rating": 4.5,
  "difficulty": 3,
  "workload": 4,
  "teaching_quality": 5,
  "course_interest": 4,
  "attendance_review": "每节课点名",
  "exam_review": "开卷考试",
  "assignment_review": "三次作业",
  "semester": "2023-2024-1",
  "year": 2023,
  "teacher_uids": ["T12345"],
  "teacher_names": ["张教授"]
}
```

## 论坛调用

### 聚合信息流 `GET /api/v1/forum/feed`

返回当前全站热门帖子列表（排序语义见 [论坛模块](../modules/forum/index.md)）。

### 发布帖子 `POST /api/v1/forum/posts`

**请求体**：

```json
{
  "boardId": "main",
  "title": "关于选课的讨论",
  "content": "大家觉得这学期的……",
  "tagSlugs": ["选课", "求助"]
}
```

### 帖子互动 `POST /api/v1/forum/posts/{id}/reactions`

**请求体**：

```json
{
  "value": 1
}
```

`value`：`1` 为点赞，`-1` 为踩，`0` 为取消。

## 校园数据边界

校园侧数据（教务、图书馆、场馆等）不由本 API 代理：

- 依赖**武大个人会话**的能力由 App 直连，服务端不接收教务 Cookie / 密码，见 [校园边界](../modules/campus_proxies.md)。
- 外部只读数据补充（如给分大盘）由服务端内部客户端拉取，**不对外暴露代理路由**，见 [给分与统计](../modules/course/course_grades.md)。

## 集成 FAQ

### 列表性能

列表接口支持分页参数（`page` / `limit` 或 `limit` / `cursor`，以 OpenAPI 为准）。客户端无限滚动时建议 `limit` 保持在 20 左右。

### 响应异常排查

**Q：为什么接口返回 401 但没有具体的错误提示？**

A：请检查 `Authorization` Header 格式。令牌过期时返回业务码 `1002`（可静默刷新）；登录凭据错误统一返回业务码 `1004`。语义见 [错误码](./error_codes.md)。

## 相关

- [API 使用指南](./overview.md)
- [API 接口参考（摘要）](./full_reference.md)
- [错误码](./error_codes.md)
- [HTTP 注册规范](./http_api.md)
