---
sidebar_position: 6
title: CLI 命令参考
slug: cli-reference
sidebar_label: CLI 参考
description: serve / worker / cli / migrate / root / seed 顶层命令
---

以 `server/cmd` 为准。二进制常见名 `luotopia-backend`。

## 顶层命令

```bash
go run ./cmd <command> [args]
# 或
./luotopia-backend <command> [args]
```

| 命令 | 说明 |
|------|------|
| `serve` | 启动 HTTP API |
| `worker` | 启动后台队列 worker |
| `cli` | 交互式 / 单次运维 CLI |
| `migrate` | 数据库迁移（`up` / `status` / `bootstrap`） |
| `root` | 修复 root 管理员身份（`repair`） |
| `seed` | 导入外部数据集（`master-timetable`） |

配置路径优先级：`CONFIG_PATH` → `--config` → 默认 `config/config.json`。

## serve

```bash
go run ./cmd serve --config config/config.json
```

- 监听端口：`server.port`（Docker 样例多为 6262）
- 健康检查：`GET /health`
- Metrics：默认独立端口（`monitoring.metrics_host` + `metrics_port`），主 API 默认不挂 `/metrics`

## worker

```bash
go run ./cmd worker run --config config/config.json
```

- 当前实现要求传子参数 `run`（详见 `cmd/server.go` / worker 包）
- Worker 可单独开 metrics；端口可用 `worker.metrics_port` 覆盖 `monitoring.metrics_port`

## cli

```bash
# 交互模式
go run ./cmd cli

# 单次命令
go run ./cmd cli <operation> [args]
```

当前内置一级操作（`cmd/cli/main.go`）：

| 操作 | 说明 |
|------|------|
| `search` | 搜索课程 / 教师 / 评价 |
| `course` | 查询课程 |
| `teacher` | 查询教师 |
| `review` | 查询评价 |
| `suggest` | 搜索建议 |
| `random` | 随机数据 |
| `user` | 用户相关运维 |
| `admin` | 管理相关运维 |
| `embedding` | Embedding 相关 |
| `review-ext` / `course-ext` / `teacher-ext` | 扩展查询 |
| `status` | 服务状态探测 |

示例：

```bash
go run ./cmd cli search 高等数学 --type=courses --limit=5
go run ./cmd cli status
go run ./cmd cli help   # 交互模式内 help / exit
```

> [!NOTE]
> `migrate`（`up` / `status` / `bootstrap`）、`root repair`、`seed master-timetable` 为当前 `bootstrap` 注册的独立顶层命令，见下。生产迁移用 `migrate up`，本地开发/测试可用 `RUN_AUTOMIGRATE=1`（见 [数据库迁移](./architecture/migrations.md)）。

## migrate

```bash
go run ./cmd migrate up --config config/config.json
go run ./cmd migrate status
go run ./cmd migrate bootstrap
```

- `up`：应用全部待执行迁移
- `status`：列出各版本状态
- `bootstrap`：引导身份数据（角色 / 权限 / root / 匿名用户）

## root

```bash
go run ./cmd root repair --config config/config.json
```

修复 root 管理员身份（密码取自 `LUOTOPIA_ROOT_PASSWORD` / `LUOTOPIA_ROOT_PASSWORD_FILE` / 配置 `identity.bootstrap.rootPassword`）。

## seed

```bash
go run ./cmd seed master-timetable --data-dir=../WHU-Master-Timetable/data [--year 2025] [--semester 1] [--force]
```

把 WHU-Master-Timetable 归档的学期数据导入 `master_courses`，让归档学期可检索。

## 配置与 unknown 字段

非法配置键会导致启动失败，例如：

```text
unknown config field(s): monitoring.host, weather
```

详见 [配置手册](./deployment/config.md) 与 `server/config/README.md`。

## 相关

- [服务端概览](./index.md)
- [配置手册](./deployment/config.md)
- [环境搭建](./development/setup.md)
