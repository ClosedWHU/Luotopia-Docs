---
title: 业务接口调用规范
slug: detailed-reference
---

# 业务接口调用规范

本文档提供 Luotopia Server 核心业务接口的请求与响应规范，旨在帮助开发者准确完成客户端对接。

## 1. 认证机制 (Authentication)

### 1.1 常规认证 (JWT)
所有受保护的接口均需在 Header 中携带 `Authorization: Bearer <JWT_TOKEN>`。

### 1.2 高级安全认证 (X-Api-Sign)
针对开放平台或敏感操作，系统要求计算签名以防止重放攻击和数据篡改：
- `X-Api-Key`: 开发者唯一标识。
- `X-Api-Ts`: Unix 时间戳（秒）。
- `X-Api-Sign`: 基于 HMAC-SHA256 的签名摘要。

**签名逻辑示例 (Node.js)**:
```javascript
const crypto = require('crypto');
const ts = Math.floor(Date.now() / 1000);
const secret = 'your_api_secret';
const sign = crypto.createHmac('sha256', secret)
                   .update(`${ts}\n${method}\n${path}`)
                   .digest('hex');
```

---

## 2. 身份认证接口 (Identity)

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

### 2.3 [弃用] 匿名登录 `POST /api/v1/user/login/anonymous`
> [!WARNING]
> 该接口计划在未来版本中下线，请优先使用注册账号登录。

---

## 3. 课程评价接口 (Course & Reviews)

### 3.1 提交评价 `POST /api/v1/reviews`
支持用户对课程进行详细维度的评分。需携带 `Authorization` 或 `CF-Turnstile-Response`。

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

## 4. 论坛接口 (Forum)

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

## 5. 校园数据集成 (HAM Gateway)

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
