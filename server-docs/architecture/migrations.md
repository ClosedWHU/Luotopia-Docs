---
sidebar_position: 4
title: 数据库迁移
sidebar_label: 数据库迁移
---

服务端用版本化迁移升级生产 schema；进程内 AutoMigrate 仅用于本地开发/测试（`RUN_AUTOMIGRATE=1`）。

## 何时执行

- 生产：`migrate up`（`go run ./cmd migrate up`）应用全部待执行迁移；`migrate status` 查看状态；`migrate bootstrap` 引导身份数据（角色 / 权限 / root / 匿名用户）。
- 本地开发 / 测试：设 `RUN_AUTOMIGRATE=1` 后启动 `serve` / `worker`，`MaybeAutoMigrate` 会执行进程内迁移并 bootstrap；未设该变量时跳过迁移与 bootstrap。

## 逻辑概要（`internal/platform/database`）

典型顺序：

1. 连接 Postgres
2. 安装扩展：`vector`、`pg_trgm`；若可用则 `pg_jieba`
3. 应用按版本顺序的 schema 迁移（`MigrateUp` / `runSchemaMigrations`）
4. Bootstrap 必要用户/数据（`BootstrapIdentity`；如 anonymous、root admin 等，以实现为准）

全量初始 schema 以内嵌 SQL 提供（`sql/001_initialize_schema.sql`），增量变更走版本化迁移。

## 新增字段

1. 修改对应 `model`
2. 在 `internal/platform/database/migrations.go` 增加下一个前向迁移版本
3. 对新部署的初始 schema 同步更新 `runAutoMigrate`（仅 dev/test 路径）；不要依赖它升级已部署数据库
4. 迁移**不得**包含破坏性 schema 操作；重命名/删除需要单独的数据迁移方案

## 搜索索引

全文检索索引多在搜索服务初始化或迁移逻辑中创建（jieba/`simple` + trgm + 可选向量索引）。

## 相关

- [数据库设计与建模](./database_design.md)
- [已移除与迁移](../meta/removed_and_migrated.md)
- [服务端概览](../index.md)
