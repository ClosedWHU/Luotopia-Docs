---
title: API 接口参考（摘要）
sidebar_label: 接口参考（摘要）
sidebar_position: 3
---
# Luotopia Server API 接口参考（摘要）

> **权威来源**：运行中服务导出的 OpenAPI（如 `/openapi.json` 或仓库 `server/openapi.json`）。  
> 本文仅为**索引级**常用端点摘要，**不是**第二套 API 规范。字段类型、枚举、错误体以 OpenAPI 为准。  
> 认证：`Authorization: Bearer`；`/api/v1` 默认需登录（白名单除外）。无全站 `X-Api-Sign`。  
> 安装包更新 / 热更新 **不在**本 API 主路径，见 [官网与外部面](../modules/external_surfaces.md)。

---

## 1. 账号与认证

### 1.1 用户注册
- **端点**: `POST /api/v1/user/register`
- **说明**: 注册新账号。
- **请求体 (Body)**:
  - `username` (string, 必填, 最小长度 3): 用户名。
  - `password` (string, 必填, 最小长度 6): 密码。
  - `email` (string, 格式: email): 电子邮箱。
- **返回数据 (Response)**:
  - `token` (string): JWT 访问令牌。
  - `user`: 用户基本信息。
- **错误码**:
  - `1001`: 输入格式不规范（如用户名太短）。
  - `409`: 用户名或邮箱已存在。

### 1.2 用户登录
- **端点**: `POST /api/v1/user/login`
- **说明**: 使用账号密码登录。
- **请求体 (Body)**:
  - `username` (string, 必填): 用户名或邮箱。
  - `password` (string, 必填): 密码。
- **返回数据 (Response)**: 同注册。
- **错误码**:
  - `401`: 用户名或密码错误。

### 1.3 武大 SSO 单点登录
- **开始 SSO**: `GET /api/v1/user/sso/start?provider=whu`
  - 返回 `{ "url": "..." }`，客户端需引导用户跳转至该 URL。
- **回调**: `GET /api/v1/user/sso/callback`
  - 后端自动处理授权码并建立会话。

### 1.4 设备注册 / 成绩同步

- **设备**: `POST /api/v1/devices/register`（Bearer；平台与 push token 字段以 OpenAPI 为准）
- **成绩资格同步**: `POST /api/v1/user/transcript/sync`（Bearer；客户端上传成绩行，**无**教务 Cookie）

---

## 2. 课程与评价

### 2.1 搜索课程
- **端点**: `GET /api/v1/search/courses`
- **参数 (Query)**: `q` (关键词), `page`, `limit`。
- **返回**: 课程分页列表。

### 2.2 评价管理
- **获取评价**: `GET /api/v1/courses/{course_uid}/reviews`
- **提交评价**: `POST /api/v1/reviews`
  - `Body`: `course_uid`, `teacher_uid`, `title`, `content`, `rating` (1-5), `is_anonymous`。
- **点赞/踩**: `POST /api/v1/reviews/{uid}/interact`
  - `Body`: `type` (1: 点赞, -1: 点踩, 0: 取消)。

### 2.3 成绩统计
- **提交成绩**: `POST /api/v1/course/grades/submit`
  - `Body`: `course_uid`, `total_score`, `usual_score`, `exam_score`, `semester`, `year`。
- **查看统计**: `GET /api/v1/course/grades/stats/{course_uid}?teacher_uid=...`
  - 返回：平均分、最高分、最低分、分数分布、样本量。

---

## 3. 校园助手

### 3.1 空闲教室查询
- **端点**: `GET /api/v1/classrooms/empty`
- **参数 (Query)**:
  - `campus`: 文理学部 (Main), 信息学部 (Information) 等。
  - `building`: 教学楼名。
  - `day_of_week` (1-7), `section` (1-13), `week` (周次)。
- **返回**: 可用教室列表。

### 3.2 课表（服务端）

以 `campus/timetable` 注册路由为准，常见包括：

- `GET/POST /api/v1/timetable`、`/api/v1/timetable/{id}`
- `GET /api/v1/timetable/master`（全校/主数据类能力，以 OpenAPI 为准）

个人教务课表的抓取与会话由 **App + whu_auth** 完成，**不是**服务端拿用户密码去爬教务。

### 3.3 认证校园服务

- 教务、图书馆、场馆等与个人武大账户相关的请求由 App 直连。
- 服务端不提供校园 Cookie / Token 透传接口。

---

## 4. 学习资料

### 4.1 搜索与下载

- **搜索**: `GET /api/v1/materials`（query 含 course / teacher / q 等，以 OpenAPI 为准）
- **下载**: `GET /api/v1/materials/{material_uid}/download`

### 4.2 上传

- **端点**: `POST /api/v1/materials/upload`
- **认证**: Bearer Token
- **请求体**: `multipart/form-data`（字段以 OpenAPI / handler 为准）

---

## 5. 社区论坛

### 5.1 帖子操作
- **获取列表**: `GET /api/v1/forum/posts?category=...&page=...`
- **发布帖子**: `POST /api/v1/forum/posts`
  - `Body`: `title`, `content`, `category`, `tags`。
- **帖子详情**: `GET /api/v1/forum/posts/{uid}`

### 5.2 评论
- **获取评论**: `GET /api/v1/forum/posts/{uid}/comments`
- **发布评论**: `POST /api/v1/forum/posts/{uid}/comments`

---

## 6. 系统与公共接口

### 6.1 健康检查与配置
- **健康状态**: `GET /health`
- **系统配置**: `GET /api/v1/system/config` (获取公告、功能开关)。
- **更新检测**: `GET /api/v1/system/update?platform=android`

---

## 7. 错误码全集

| 错误码 | 描述 |
| :--- | :--- |
| `1001` | **Bad Request**: 参数格式错误或必填项缺失。 |
| `1002` | **Unauthorized**: 未登录或令牌过期。 |
| `1003` | **Forbidden**: 权限不足（如非管理员访问管理接口）。 |
| `404` | **Not Found**: 资源不存在。 |
| `409` | **Conflict**: 资源冲突（如用户名已占用）。 |
| `429` | **Too Many Requests**: 触发频率限制。 |
| `500` | **Internal Server Error**: 服务器发生不可预期的错误。 |

---
**文档版本**: v1.0.1  
**更新日期**: 2026-05-12
