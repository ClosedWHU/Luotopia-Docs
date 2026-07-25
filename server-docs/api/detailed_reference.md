---
title: 业务接口调用规范
sidebar_label: 调用规范
slug: detailed-reference
sidebar_position: 2
---
# 业务接口调用规范

> **权威来源**：运行中服务的 OpenAPI（`/openapi.json`）。本文为常用调用**摘要**，字段与路径冲突时以 OpenAPI / 代码为准。  
> 不在此文档中复制完整 schema；新增接口请改 OpenAPI 生成物，而非只改本文。

本文说明认证方式与若干核心调用形态，帮助客户端对接。

## 1. 认证机制

### 1.1 JWT（推荐）

受保护接口在 Header 中携带：

```http
Authorization: Bearer <access_token>
```

`/api/v1/*` 默认要求认证；仅登录注册、刷新 token、验证码等白名单路径可匿名。详见 [安全策略](../architecture/security_policy.md)。

### 1.2 用户 API 凭证（可选，集成用）

```http
X-Api-Key: <key>
X-Api-Secret: <secret>
```

用于用户级脚本集成，**不是**对请求体的 HMAC 签名。权限限于部分只读 GET。

全站请求 HMAC 的迁移说明见 [已移除与迁移](../meta/removed-and-migrated.md#全站请求-hmac)。

---

## 2. 身份认证接口

### 2.1 用户注册 `POST /api/v1/user/register`
用于新用户入驻，需提供基础账号信息。

**Request Body**:
```json
{
  "username": "luotopian",
  "password": "very_secure_password",
  "email": "student@whu.edu.cn"
}
```

### 2.2 用户登录 `POST /api/v1/user/login`
支持用户名/密码验证。登录成功后，服务器会设置 `jwt` Cookie 并返回 Token。

### 2.3 其它认证

Passkey、MFA、邮箱验证、密码重置、token 刷新等路径见 OpenAPI；公开能力以 `AccessPublic` 为准（[HTTP 注册规范](./httpapi.md)）。

---

## 3. 课程评价接口

### 3.1 提交评价 `POST /api/v1/reviews`
支持用户对课程进行详细维度的评分。需携带 `Authorization`。

**Request Body**:
```json
{
  "course_uid": "CS101-WHU",
  "title": "课程作业量适中",
  "content": "老师讲得很细...",
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

---

## 4. 论坛接口

### 4.1 获取聚合信息流 `GET /api/v1/forum/feed`
返回当前全站最热的帖子列表。

### 4.2 发布帖子 `POST /api/v1/forum/posts`
**Request Body**:
```json
{
  "board_id": "main",
  "title": "关于选课的讨论",
  "content": "大家觉得这学期的...",
  "tag_slugs": ["选课", "求助"]
}
```

### 4.3 帖子互动 `POST /api/v1/forum/posts/{id}/reactions`
**Request Body**:
```json
{
  "value": 1
}
```
`value`: `1` 为点赞，`-1` 为踩。

---

## 5. 校园数据集成

该模块负责桥接校内开放数据平台。

### 5.1 课程搜索 `GET /api/v1/external/ham/course/search`
**Query Parameters**:
- `keyword`: 搜索关键词（如：计算机）
- `keyword_type`: `0` 名称，`1` 老师

---

## 6. 开发建议与集成 FAQ

### 6.1 列表性能优化
所有列表接口均支持 `page` 和 `limit` 参数。建议在客户端实现无限滚动时，`limit` 保持在 20 左右。

### 6.2 响应异常排查
**Q: 为什么接口返回 401 但没有具体的错误提示？**
A: 请检查 `Authorization` Header 格式。如果 Token 已过期，系统会返回业务代码 `1002`。

---
[返回目录](../index.md)
