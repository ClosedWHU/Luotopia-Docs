---
title: 日志规范与审计
sidebar_label: 日志与审计
sidebar_position: 1
---

Luotopia Server 使用 `uber-go/zap` 作为全局日志框架，并提供针对管理员操作的自动审计功能。

## 结构化日志

系统要求所有日志必须以结构化（JSON）格式输出，严禁使用 `fmt.Println`。

### 使用示例

```go
// 错误日志
logger.Error("failed to process order", zap.Error(err), zap.Uint64("order_id", id))

// 审计日志
logger.Info("admin deleted post", zap.String("admin", "admin_name"), zap.Uint64("post_id", pid))
```

## 日志级别规范

- **DEBUG**：仅在开发环境中开启，记录 SQL 执行详情、请求原始包体等。
- **INFO**：记录关键业务流程（如用户登录、文件上传）。
- **WARN**：记录非致命性错误，但可能暗示系统性能或配置问题。
- **ERROR**：记录所有需要人工介入或自动报警的错误。

## 操作审计

所有标记为 `Admin` 的路由在调用时，都会被 `AuditMiddleware` 拦截并记录以下信息：

- 操作者 ID
- 访问 IP
- HTTP 方法与路径
- 响应状态码

审计日志会持久化存储在数据库的 `admin_logs` 表中。

## 相关

- [基础设施与平台底座](./index.md)
- [监控与 Metrics](../../deployment/monitoring.md)
- [安全策略](../../architecture/security_policy.md)
