---
title: API 接口参考（摘要）
slug: full-reference
sidebar_label: 接口参考（摘要）
sidebar_position: 4
---

> **权威来源**：运行中服务导出的 OpenAPI（如 `/openapi.json` 或仓库 `server/openapi.json`）。
> 本文仅为**索引级**常用端点摘要，**不是**第二套 API 规范。字段类型、枚举、错误体以 OpenAPI 为准。
> 认证：`Authorization: Bearer`；`/api/v1` 默认需登录（声明 `AccessPublic` 的除外）。无全站 `X-Api-Sign`。
> 安装包更新 / 热更新 **不在**本 API 主路径，见 [官网与外部面](../modules/external_surfaces.md)。

## 账号与认证

### 用户注册

- **端点**：`POST /api/v1/user/register`
- **说明**：注册新账号；需先完成邮箱验证与武大注册授权（配套路径如 `POST /api/v1/user/register/email-code`、`POST /api/v1/user/register/whu/authorize`）。
- **请求体**（摘要，完整 schema 以 OpenAPI 为准）：`username`（至少 3 字符）、`password`、`email`、`whu_account`、`whu_registration_authorization`。
- **返回数据**：令牌与用户信息（字段以 OpenAPI 为准）。
- **错误**：`400` / `409` / `429`；业务码语义见 [错误码](./error_codes.md)。

### 用户登录

- **端点**：`POST /api/v1/user/login`
- **说明**：账号密码登录；启用 MFA 的账号返回 MFA 挑战（`mfa_required`）。
- **请求体**：`identifier`（用户名或邮箱）、`password`。
- **返回数据**：`token`、`refresh_token`、`user`、`mfa_required`（以 OpenAPI 为准）。
- **错误**：凭据错误统一返回 `401`，不区分「用户不存在」与「密码错误」；见 [错误码](./error_codes.md)。

### 社交登录（Ham 等）

- **开始**：`GET /auth/login/{provider}`
- **回调**：`GET /auth/callback/{provider}`

提供商由 `identity.social.providers` 配置，见 [武大身份说明](../modules/identity/whu_auth.md)。

### 设备注册与评价资格

- **设备**：`POST /api/v1/devices/register`（Bearer；平台与 push token 字段以 OpenAPI 为准）
- **资格导入**：`POST /api/v1/user/review-eligibility/sync`（Bearer；服务端核验修读记录后授予评价与给分资格，**不接收**教务 Cookie / 密码）
- **资格查询**：`GET /api/v1/user/review-eligibility`

## 课程与评价

### 搜索课程

- **端点**：`GET /api/v1/search/courses`
- **查询参数**：`q` 与 `course_name` / `professor` / `department` 等过滤（以 OpenAPI 为准）。
- **返回**：课程列表。

### 评价管理

- **获取评价**：`GET /api/v1/courses/{course_uid}/reviews`
- **提交评价**：`POST /api/v1/reviews`（`course_uid`、`title`、`content`、`rating` 等字段以 OpenAPI 为准；需评价资格）
- **点赞 / 点踩**：`POST /api/v1/reviews/{review_uid}/interact`（`type`：`1` 点赞、`-1` 点踩、`0` 取消）

### 给分统计

- **给分视图**：`GET /api/v1/course/grades/view/{course_uid}`（自有样本 + 可选 Ham 补充的合并视图）
- **课程 / 教师解析**：`POST /api/v1/course/grades/resolve`、`POST /api/v1/course/grades/prepare/{course_uid}`、`GET /api/v1/course/grades/teachers/{course_uid}`

低样本时聚合被抑制（阈值为实现细节）。详见 [给分与统计](../modules/course/course_grades.md)。

## 校园助手

### 空闲教室查询

- **端点**：`GET /api/v1/classrooms/empty`
- **查询参数**：`campus`、`building`、`day_of_week`（1-7）、`section`（1-13）、`week`。
- **返回**：可用教室列表。

### 课表（服务端）

以 `campus/timetable` 注册路由为准，常见包括：

- `GET/POST /api/v1/timetable`、`PUT/DELETE /api/v1/timetable/{id}`
- 主数据类：`GET /api/v1/timetable/master` 及 `/master/periods`、`/master/search`、`/master/suggestions`（以 OpenAPI 为准）

个人教务课表的抓取与会话由 **App + whu_auth** 完成，**不是**服务端拿用户密码去爬教务。

### 认证校园服务

- 教务、图书馆、场馆等与个人武大账户相关的请求由 App 直连。
- 服务端不提供校园 Cookie / Token 透传接口。

### 食堂

路由前缀 `/api/v1/dining`（OpenAPI Tag `Dining`）；管理端 `/api/v1/dining/admin/*`（权限码 `dining:manage`）。端点组与说明见 [食堂服务](../modules/dining.md)，字段与完整路径以 OpenAPI 为准。

## 学习资料

### 搜索与下载

- **搜索**：`GET /api/v1/materials`（query 含 course / teacher / q 等，以 OpenAPI 为准）
- **下载**：`GET /api/v1/materials/{material_uid}/download`

### 上传

- **端点**：`POST /api/v1/materials/upload`
- **认证**：Bearer Token
- **请求体**：`multipart/form-data`（字段以 OpenAPI 为准）

## 社区论坛

### 帖子操作

- **聚合信息流**：`GET /api/v1/forum/feed`
- **板块帖子列表**：`GET /api/v1/forum/boards/{id}/posts`
- **发布帖子**：`POST /api/v1/forum/posts`（`boardId`、`title`、`content`、`tagSlugs` 等，以 OpenAPI 为准）
- **帖子详情**：`GET /api/v1/forum/posts/{id}`
- **帖子搜索**：`GET /api/v1/forum/posts/search`

### 评论与互动

- **评论列表 / 发布**：`GET/POST /api/v1/forum/posts/{id}/comments`
- **反应**：`POST /api/v1/forum/posts/{id}/reactions`、`POST /api/v1/forum/comments/{id}/reactions`（`value`：`1` 赞、`-1` 踩、`0` 取消）

## 系统与公共接口

- **健康检查**：`GET /health`；就绪 `GET /ready`
- **系统配置**：`GET /api/v1/system/config`（远程配置 KV）
- **更新检测**：`GET /api/v1/system/update`（业务服侧；安装包主路径在官网）
- **密码策略**：`GET /api/v1/system/password-policy`

## 相关

- [错误码](./error_codes.md)（错误语义的唯一来源）
- [API 使用指南](./overview.md)
- [HTTP 注册规范](./http_api.md)
- [API 调用规范](./detailed_reference.md)
