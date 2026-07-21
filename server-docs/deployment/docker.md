---
title: Docker 部署
sidebar_label: Docker
description: Compose 服务、端口、库名、常用命令与排障
sidebar_position: 2
---
# Docker 部署

仓库：`server/docker-compose.yml`。

## 一键

```bash
cd server
docker compose up -d --build
curl -sS http://localhost:6262/health
```

开发热重载（若有覆盖文件）：

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 服务

| 服务 | 作用 |
|------|------|
| `postgres` | `Dockerfile.db`：pg18 + **pgvector** + **pg_jieba** |
| `redis` | 缓存 / 队列 |
| `luotopia-api` | `serve` |
| `luotopia-worker` | 后台任务 |
| `watchtower` | 可选自动更新镜像 |

## 端口（官方样例）

| 主机 | 容器 | 用途 |
|------|------|------|
| 6262 | 6262 | API（须等于配置 `server.port`） |
| 55432 | 5432 | Postgres |
| 6379 | 6379 | Redis |
| — | 9090 | Metrics（**默认不映射**到宿主机） |

- 健康检查：`http://localhost:6262/health`  
- 库名：`luotopia`（`POSTGRES_DB` 与 `database.name` 一致）  
- 配置：`CONFIG_PATH=config/config.docker.json`（或挂载的 config）  

## 必对齐的三项

1. **库名**：`POSTGRES_DB` = 配置 `database.name`（样例 **`luotopia`**）  
2. **配置路径**：`CONFIG_PATH=config/config.docker.json`（或你挂载的文件）  
3. **端口映射**：宿主机端口 → 容器内真实 `server.port`（勿把 6262 映射到 8080）  

容器内 DB/Redis 主机名是 `postgres` / `redis`，不是 `localhost`。

## 常用命令

```bash
docker compose ps
docker compose logs -f luotopia-api
docker compose restart luotopia-api
docker compose down
docker compose up -d --build

docker compose exec luotopia-api sh
docker compose exec postgres psql -U postgres -d luotopia
docker compose exec redis redis-cli
```

## 配置注意

- 挂载：`./config:/app/config:ro`  
- 环境：`CONFIG_PATH` 指向配置文件  
- **未知字段启动失败**（拼写错误不会静默落到默认值）  
- Metrics：`monitoring.metrics_host` / `metrics_port`；Docker 内 scrape 可用 `0.0.0.0`，勿默认公网 publish  

## 校历 JSON 数据卷（方案 B）

校历 **不是** 嵌在 Go 镜像里的 `third_party` 源码，而是运行时 **只读挂载 JSON 目录**。

| 项 | 值 |
|----|-----|
| 容器路径 | `/data/school-calendar` |
| 环境变量 | `CALENDAR_DATA_DIR=/data/school-calendar` |
| 配置项 | `server.calendar_data_dir` |
| 宿主机路径 | `SCHOOL_CALENDAR_DATA_HOST`（默认 `./data/school-calendar`） |

Compose 挂载示例：

```yaml
volumes:
  - ${SCHOOL_CALENDAR_DATA_HOST:-./data/school-calendar}:/data/school-calendar:ro
environment:
  CALENDAR_DATA_DIR: /data/school-calendar
```

### 数据从哪来

校历权威仓为独立仓库 **WHU-sb-Calendar**（与 `server/` **并列**检出，例如 `luotopia/WHU-sb-Calendar`，不要放进 `internal/domains/`）。

```bash
# 在 server/ 下：把 data/*.json 同步到默认挂载目录
./scripts/sync-calendar-data.ps1 -Source ../WHU-sb-Calendar/data

# 或 .env / .env.docker 直接指向并列仓 data/
SCHOOL_CALENDAR_DATA_HOST=../WHU-sb-Calendar/data
```

目录内只需学年 JSON（如 `2025-2026.json`），**不要**挂载整个前端工程（`src/`、`node_modules` 等）。

详见 `server/data/school-calendar/README.md` 与 [日历模块](../modules/calendar.md)。

## 数据持久化

官方 compose 使用 `./docker-volumes/postgres` 与 Redis volume（以当前 yml 为准）。`docker compose down` 不会删除 volume；需清理时再 `down -v` 或手动删除数据目录。

## Postgres 插件

Compose 不挂载或执行数据库 `init.sql`；API/Worker 启动时统一运行应用内 migration 和 bootstrap。

`Dockerfile.db` 在镜像内编译安装 **pg_jieba**；`vector`、`pg_trgm` 在运行时 `CREATE EXTENSION`。不要用官方裸 `pgvector` 镜像替代并期望有 jieba。

## 单容器示例

```bash
cd server
docker build -t luotopia-backend:latest .
docker run -d --name luotopia-api \
  -p 6262:6262 \
  -v "$(pwd)/config:/app/config:ro" \
  -v "$(pwd)/data/school-calendar:/data/school-calendar:ro" \
  -e CONFIG_PATH=config/config.json \
  -e CALENDAR_DATA_DIR=/data/school-calendar \
  luotopia-backend:latest serve
```

端口必须与配置 `server.port` 一致。入口命令以镜像 `CMD` / `command` 为准（常见 `./luotopia-backend serve`）。

## 故障排查

| 现象 | 检查 |
|------|------|
| API 映射不通 | 宿主机端口是否映射到容器内真实 `server.port` |
| 连不上库 | `database.host=postgres`、`name=luotopia`、Postgres healthy |
| metrics 宿主机 404 | `metrics_host` 是否 `0.0.0.0`；是否误绑 `127.0.0.1` 却做了端口映射 |
| 配置启动失败 | 日志中的 `unknown config field(s)` |
| 校历 ICS 无校历事件 / 读文件失败 | 挂载目录是否有 `*.json`；`CALENDAR_DATA_DIR` 是否为 `/data/school-calendar`；宿主机 `SCHOOL_CALENDAR_DATA_HOST` 是否指向含 JSON 的目录 |

## 相关

- [配置手册](./config.md)
- [监控](./monitoring.md)
- [环境搭建](../development/setup.md)
