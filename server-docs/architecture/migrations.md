---
sidebar_position: 4
title: 数据库迁移
sidebar_label: 数据库迁移
---

服务端通过版本化迁移升级生产 schema；`AutoMigrate` 仅用于初始 schema 和本地开发/测试。

## 1. 何时执行

`database.InitDB()` 在 **`serve` / `worker` / 需要 DB 的 cli 操作** 启动路径中调用（以代码为准）。

独立 migrate 命令与全量 schema SQL 的迁移说明见 [已移除与迁移](../meta/removed_and_migrated.md#独立-migrate-命令与全量-schema-sql)。

需要“只迁库、不提供 API”时，可：

- 短暂启动 `serve`/`worker` 完成初始化后退出，或  
- 短暂启动一个会调用 `database.InitDB()` 的应用命令，初始化成功后停止。仓库不再维护独立的全量 schema SQL。

## 2. 逻辑概要（`internal/platform/database`）

典型顺序：

1. 连接 Postgres  
2. 安装扩展：`vector`、`pg_trgm`；若可用则 `pg_jieba`  
3. 应用按版本顺序的 schema 迁移  
4. Bootstrap 必要用户/数据（如 anonymous 等，以实现为准）

## 3. 新增字段

1. 修改对应 `model`  
2. 在 `internal/platform/database/migrations.go` 增加下一个前向迁移版本  
3. 对新部署的初始 schema 同步更新 `runAutoMigrate`；不要依赖它升级已部署数据库  
4. 迁移不得包含破坏性 schema 操作；重命名/删除需要单独的数据迁移方案

## 4. 搜索索引

全文检索索引多在搜索服务初始化或迁移逻辑中创建（jieba/`simple` + trgm + 可选向量索引）。

---
[返回目录](../index.md)
