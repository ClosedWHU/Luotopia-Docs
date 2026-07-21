---
title: 开发规范与贡献指南
sidebar_label: 贡献规范
sidebar_position: 3
---
# 开发规范与贡献指南

为了确保 Luotopia Server 的代码质量和一致性，所有开发者必须遵守以下规范。

## 1. 代码风格
本项目严格遵循官方 Go 代码规范：
- **格式化**: 提交前必须运行 `go fmt ./...`。
- **命名**: 
    - 文件夹、文件名使用 `snake_case` (如 `user_auth.go`)。
    - 变量、函数、结构体使用 `camelCase` 或 `PascalCase`。
    - 尽量保持命名简洁，避免冗余的前缀（如在一个名为 `user` 的包中，使用 `Info` 而不是 `UserInfo`）。
- **注释**: 所有导出的函数、结构体应包含描述性的注释（Golint 友好）。

## 2. 目录结构规范

业务模块位于 `internal/domains/<name>/`，通常包含：

- `http/`：Huma 路由与 handler  
- `model/`：领域与 API 模型  
- `repo/`：持久化  
- `service/`：复杂业务（可选）  

底座：`internal/platform/`。入口：`cmd/`（仅 `serve` / `worker` / `cli`）。

## 3. API 开发流程
我们使用 Huma v2 框架，它会自动生成 OpenAPI 文档：
1. 在 `model/` 中定义 `Input` 和 `Output` 结构体。
2. 在 `http/` 中实现 Handler 函数。
3. 在 `Register` 方法中注册路由，并添加适当的 `Tags` 和 `Summary`。

## 4. Git 工作流
- **分支管理**: 开发新功能请创建 `feat/feature-name` 分支。
- **Commit Message**: 使用中文描述，并遵循以下格式：
    - `feat:`: 新功能
    - `fix:`: 修复 Bug
    - `style:`: 格式化、命名调整（不改变逻辑）
    - `refactor:`: 重构
    - `docs:`: 文档更新
- **安全性**: **严禁** 将任何配置文件（`config.json`）、凭据文件（`*.txt`, `*.key`）提交至仓库。请务必检查 `.gitignore`。

## 5. 测试要求
- 核心逻辑必须编写单元测试。
- 集成测试请放置在 `internal/services/integration` 目录下，并使用 `//go:build integration` 标签。
