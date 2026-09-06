---
title: 测试规范与实践
sidebar_label: 测试
sidebar_position: 2
---

## 1. 测试层次

- **单元测试**：纯逻辑、Mock 依赖  
- **集成测试**：Handler → Service → Repo，常用 **Postgres + Redis**（环境变量 / testcontainers，见 `internal/testutils`）  
- **E2E**：真实 HTTP 请求（可选）

## 2. 工具

- `testing` + **testify**（`assert` / `require` / `mock`）  
- 包级测试：`go test ./...`（在 `server/` 下）

## 3. 仓库约定

- 复用 `internal/testutils`、`testfactory`（若存在）  
- 集成测需要扩展时用带 **pgvector / 可选 jieba** 的镜像  
- **不要**假设默认 SQLite  

## 4. 示例结构（示意）

```go
func TestSomething(t *testing.T) {
    // 1. 准备依赖（mock 或 testutils DB）
    // 2. 调用被测函数 / handler
    // 3. assert 结果与错误码
}
```

具体中间件与 API 测试可参考：

- `internal/middleware/*_test.go`  
- 各 domain 下 `*_test.go`

## 5. 提交前

```bash
cd server
go test ./...
```

---
[返回开发指南](pathname:///server/development)
