---
title: 本地开发环境搭建
sidebar_label: 环境搭建
description: Go 服务端本地运行：配置、数据库、serve / worker
sidebar_position: 1
---

## 前置

- Go：与 `server/go.mod` 一致（1.27.0）
- PostgreSQL 14+（全文检索 / 扩展）
- Redis 6+

推荐 Postgres 用仓库 `Dockerfile.db`（**pgvector + pg_jieba + pg_trgm**）。

## 最快路径（Compose）

```bash
cd server
docker compose up -d --build
# API: http://localhost:6262/health
```

细节：[Docker 部署](../deployment/docker.md)。

### 校历数据

校历学年数据内嵌于 Go 依赖 `github.com/ClosedWHU/WHU-Calendar`（`whucalendar.LoadAllYears()`），无需同步脚本与数据挂载。升级数据即升级依赖版本。见 [日历模块](../modules/calendar.md)。

## 本机直接跑 API

### 1. 目录与配置

```bash
cd server
# 可参考
cp config/config.docker.json config/config.json
```

必改：`database`、`cache.redis_url`、`security.jwt_secret`。  
库名须与 Postgres 一致（样例 **`luotopia`**）。  
**未知配置字段会启动失败**（避免拼错静默用默认值）。

### 2. 数据库

没有 `migrate` 子命令。启动 `serve` / `worker` 时会 `InitDB()`（AutoMigrate + 扩展）。

### 3. 启动

```bash
go run ./cmd serve --config config/config.json
# 另开终端
go run ./cmd worker run --config config/config.json
```

- 端口：`server.port`  
- 健康检查：`http://localhost:<port>/health`  
- OpenAPI UI：`http://localhost:<port>/docs`（以实例为准）

## 加一个 API（简要）

1. 在对应 `internal/domains/<x>/model`（或 handler 旁）定义输入输出  
2. `repo` / `service` 写逻辑  
3. `http` 里使用 **`httpapi.Register`**，声明 `Access`（及可选 `Rate`）  
4. 启动后看 OpenAPI 是否更新  

```go
httpapi.Register(api, httpapi.Op{
    ID: "domain-verb", Method: http.MethodGet, Path: "/api/v1/...",
    Summary: "...", Tags: []string{"..."},
    Access: httpapi.AccessUser, // 或 AccessPublic / AccessAdmin / AccessSuperAdmin
}, h.Handler)
```

规范：[HTTP 注册规范](../api/http_api.md)、仓库 `server/docs/api-conventions.md`。更细：[服务端开发规范](./contributing.md)。

## 常见问题

| 现象 | 处理 |
|------|------|
| 连不上库 | host / 端口 / 库名；Compose 内用 `postgres` 主机名 |
| 配置启动失败 | 看日志 `unknown config field(s)` |
| JWT 异常 | 检查 `jwt_secret` 是否配置 |

## 相关

- [CLI](../cli_reference.md)
- [配置手册](../deployment/config.md)
- [安全策略](../architecture/security_policy.md)
