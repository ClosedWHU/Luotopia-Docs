---
sidebar_position: 4
title: 数据库迁移
sidebar_label: 数据库迁移
slug: migrations
---
# 数据库迁移

服务端主要使用 GORM **AutoMigrate**，在进程初始化数据库时对齐表结构与模型。

## 1. 何时执行

`database.InitDB()` 在 **`serve` / `worker` / 需要 DB 的 cli 操作** 启动路径中调用（以代码为准）。

独立 migrate 命令与全量 schema SQL 的迁移说明见 [已移除与迁移](../meta/removed-and-migrated.md#独立-migrate-命令与全量-schema-sql)。

需要“只迁库、不提供 API”时，可：

- 短暂启动 `serve`/`worker` 完成初始化后退出，或  
- 短暂启动一个会调用 `database.InitDB()` 的应用命令，初始化成功后停止。仓库不再维护独立的全量 schema SQL。

## 2. 逻辑概要（`internal/platform/database`）

典型顺序：

1. 连接 Postgres  
2. 安装扩展：`vector`、`pg_trgm`；若可用则 `pg_jieba`  
3. AutoMigrate 各域模型  
4. Bootstrap 必要用户/数据（如 anonymous 等，以实现为准）

## 3. 新增字段

1. 修改对应 `model`  
2. 重启服务触发 AutoMigrate  
3. GORM **不会**自动删列；重命名/删列请手写 SQL

## 4. 搜索索引

全文检索索引多在搜索服务初始化或迁移逻辑中创建（jieba/`simple` + trgm + 可选向量索引）。

---
[返回目录](../index.md)
