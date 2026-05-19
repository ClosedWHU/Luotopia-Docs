# 全局错误码规范

Luotopia Server 使用统一的错误响应格式，结合 HTTP 状态码与业务代码（Business Code）来表达详细的错误语义。

## 1. 响应格式

所有错误响应均遵循以下 `ErrorResponse` 结构：

```json
{
  "success": false,
  "code": "BAD_REQUEST",
  "business_code": 1001,
  "message": "错误详细说明",
  "request_id": "req-xxxx-yyyy",
  "timestamp": "2026-05-13T21:30:00Z",
  "details": {
    "field": "username",
    "error": "minLength"
  }
}
```

## 2. 错误码定义

### 2.1 系统级错误 (ErrorCode)

| 标识符 | HTTP 状态码 | 说明 |
| :--- | :--- | :--- |
| `BAD_REQUEST` | 400 | 请求参数格式错误或校验未通过 |
| `UNAUTHORIZED` | 401 | 身份认证失败或 Token 无效 |
| `FORBIDDEN` | 403 | 权限不足，无法执行该操作 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 资源冲突（如用户名已存在） |
| `INTERNAL_SERVER_ERROR` | 500 | 服务器内部逻辑错误 |
| `DATABASE_ERROR` | 500 | 数据库操作异常 |

### 2.2 业务逻辑代码 (Business Code)

业务代码用于引导客户端执行特定逻辑（如自动刷新 Token 或跳转登录）。

#### 身份与认证 (1000 - 1999)
| 业务码 | 说明 | 建议处理方式 |
| :--- | :--- | :--- |
| 1001 | 令牌无效 (Invalid Token) | 引导用户重新登录 |
| 1002 | 令牌已过期 (Token Expired) | 执行静默刷新 (Refresh Token) |
| 1003 | 用户不存在 (User Not Found) | 提示用户账号错误 |
| 1004 | 密码错误 (Invalid Password) | 提示用户检查密码 |
| 1005 | 权限被拒绝 (Permission Denied) | 提示联系管理员 |

#### 课程与评价 (2000 - 3999)
| 业务码 | 说明 |
| :--- | :--- |
| 2000 | 课程不存在 (Course Not Found) |
| 2001 | 课程审核中 (Course Pending) |
| 3000 | 评价内容不存在 (Review Not Found) |

## 3. 调试与日志

当客户端遇到非预期的错误时：
1. **记录 Request ID**: 所有的 `request_id` 均会记录在服务端的生产日志中。
2. **查看 Details**: 在测试环境下，`details` 字段会包含 Huma 抛出的具体字段校验失败信息。

---
[返回目录](../index.md)
