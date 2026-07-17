---
title: 配置手册
sidebar_label: 配置
description: 核心配置项、unknown 字段校验与生产注意
---

# 配置手册

配置文件 JSON/JSONC 等，由 `CONFIG_PATH` 或 `--config` 指定。  
加载后映射到 `Config`；**未知键会启动失败**。

## 核心项

| 配置项 | 说明 | 样例 |
|--------|------|------|
| `environment` | 环境标识 | `dev` / `production` |
| `server.port` | HTTP 端口 | `6262` |
| `server.public_base` | 对外 Base URL | `https://api.example.com` |
| `server.calendar_data_dir` | 校历学年 JSON 目录 | Docker 内 `/data/school-calendar`；可用 `CALENDAR_DATA_DIR` 覆盖 |
| `database.host` | DB 主机 | Compose 内 `postgres` |
| `database.name` | 库名 | `luotopia`（与 Postgres 一致） |
| `cache.redis_url` | Redis | `redis:6379` |
| `security.jwt_secret` | JWT 密钥 | **生产必换** |
| `security.rate_limit` | 限流（实现窗口见 `rate_window`） | `200` |
| `monitoring.metrics_host` | metrics 绑定 | 本机 `127.0.0.1`；容器 scrape 用 `0.0.0.0` |
| `monitoring.metrics_port` | metrics 端口 | `9090` |
| `monitoring.expose_metrics_on_api` | 是否在业务口挂 `/metrics` | `false` |
| `monitoring.metrics_basic_auth_*` | metrics Basic Auth | 可选 |
| `ai_service.*` | 服务端 AI 提供商 | 按需 |

## Identity（摘要）

- `identity.enabled`：是否启用身份模块  
- `identity.oidc.*`：令牌 TTL、签发密钥等  
- `identity.social.providers`：社交登录（如 HAM）；字段为 camelCase  

完整字段见 `internal/platform/config` 与样例 `config/*.json`。

## Unknown 字段

拼写错误或已删除模块配置（例如 `weather`、`monitoring.host`）会报：

```text
unknown config field(s): ...
```

不会静默落到默认值。

## 环境变量

| 变量 | 说明 |
|------|------|
| `CONFIG_PATH` | 配置文件路径（Compose 样例：`config/config.docker.json`） |
| `CALENDAR_DATA_DIR` | 校历 JSON 目录（容器内通常 `/data/school-calendar`） |
| `SCHOOL_CALENDAR_DATA_HOST` | **仅 Compose 宿主机侧**：挂载源路径（默认 `./data/school-calendar`；可指并列仓 `../WHU-sb-Calendar/data`） |
| `WATCHTOWER_HTTP_API_TOKEN` | Watchtower（若启用） |

路径解析优先级（代码）：配置/注入目录 → `CALENDAR_DATA_DIR` → 存在则 `/data/school-calendar` → 本地 `assets/school-calendar`。

## 生产检查清单

1. 密钥不进 git（含 `credentials.txt`）  
2. `public_base` 用 `https://`  
3. Metrics 不裸奔公网  
4. 库名 / Redis / 端口与编排一致  
5. 校历数据卷已挂载且目录内有学年 `*.json`  

## 相关

- [Docker](./docker.md)
- [监控](./monitoring.md)
- [安全策略](../architecture/security_policy.md)
