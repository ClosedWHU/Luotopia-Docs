---
title: 数据库迁移
slug: migrations
---

# 数据库迁移 (Migrations)

Luotopia Server 使用 GORM 的 `AutoMigrate` 功能实现全自动的模式 (Schema) 迁移，确保数据库结构始终与代码中的模型定义保持同步。

## 1. 迁移执行方式

系统在启动时（无论是在 `serve` 模式还是 `migrate` 模式下）都会调用 `database.InitDB()`。

### 命令行手动触发
如果你只想执行迁移而不启动 HTTP 服务，可以使用以下命令：
```bash
go run cmd/main.go migrate
```
该命令会连接数据库、创建必要的 Schema、安装插件（如 `vector`, `pg_trgm`）并执行所有表的 `AutoMigrate`。

## 2. 迁移逻辑详解 (`internal/platform/database/init.go`)

### 执行顺序
1. **基础插件安装**: 确保 `pgvector` 等核心插件已在 PostgreSQL 中启用。
2. **基础表迁移**: 迁移用户、角色、权限等底座表。
3. **业务表迁移**: 迁移课程、评价、论坛、课表等领域模型。
4. **关系表迁移**: 建立多对多关联关系。
5. **初始化数据 (Seed)**: 确保内置的 `anonymous` 和 `admin` 用户存在。

## 3. 开发建议：如何新增字段
1. 在对应的 `model/*.go` 文件中修改结构体。
2. 运行 `go run cmd/main.go migrate`。
3. GORM 会自动执行 `ALTER TABLE` 增加新列。

> [!WARNING]
> GORM 的 `AutoMigrate` **不会** 自动删除已有的列，以防止意外数据丢失。如果需要重命名或删除列，请手动编写 SQL 脚本或通过数据库管理工具操作。

---
[返回目录](../index.md)
