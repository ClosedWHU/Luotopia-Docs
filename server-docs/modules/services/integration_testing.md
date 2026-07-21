---
title: 集成测试
sidebar_label: 集成测试
sidebar_position: 3
---
# 集成测试

确保域在真实依赖（Postgres、Redis 等）下行为正确。细节以实现与 `internal/testutils` 为准。

> 状态：能力随仓库演进；下列为**约定**，非完整框架源码。

## 层次

| 层 | 说明 |
|----|------|
| 单元 | mock 依赖，测纯逻辑 |
| 集成 | Handler → Service → Repo + 真实 DB/缓存 |
| E2E | 可选 HTTP 对运行中的 `serve` |

日常：`cd server && go test ./...`

## 环境

- 集成测优先 **Postgres + Redis**（testcontainers 或 compose，见仓库）。  
- 需要 FTS / vector 时使用与开发一致的扩展镜像（`Dockerfile.db`）。  
- **不要**默认 SQLite。  
- 测试库账号密码仅用于本地/CI 隔离实例，**禁止**使用生产凭据。

## 约定

- 复用 `internal/testutils`、工厂方法（若存在）。  
- 每测清理或使用事务回滚，避免脏数据串测。  
- 断言业务错误码 / HTTP 状态，而非脆弱的完整 JSON 字符串（除非契约测试）。  
- 不在测试里硬编码生产密钥。

## 示例结构（示意）

```go
func TestExample(t *testing.T) {
    // 1. SetupTestEnv / testutils
    // 2. 调用 handler 或 service
    // 3. require 结果与错误
}
```

参考：`internal/middleware/*_test.go`、各 domain `*_test.go`。

## 相关

- [开发测试规范](../../development/testing.md)  
