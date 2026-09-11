---
title: 配置手册
sidebar_label: 配置
description: 核心配置项、unknown 字段校验与生产注意
sidebar_position: 1
---

配置文件 JSON/JSONC 等，由 `CONFIG_PATH` 或 `--config` 指定。  
加载后映射到 `Config`；**未知键会启动失败**。

## 核心项

| 配置项 | 说明 | 样例 |
|--------|------|------|
| `environment` | 环境标识 | `dev` / `production` |
| `server.port` | HTTP 端口 | `6262` |
| `server.public_base` | 对外 Base URL | `https://api.example.com` |
| `database.host` | DB 主机 | Compose 内 `postgres` |
| `database.name` | 库名 | `luotopia`（与 Postgres 一致） |
| `cache.redis_url` | Redis | `redis:6379` |
| `security.jwt_secret` | JWT 密钥 | **生产必换** |
| `security.rate_limit` | 默认 API 限流配额（窗口见 `security.rate_window`） | 值以部署配置为准 |
| `monitoring.metrics_host` | metrics 绑定 | 本机 `127.0.0.1`；容器 scrape 用 `0.0.0.0` |
| `monitoring.metrics_port` | metrics 端口 | `9090` |
| `monitoring.expose_metrics_on_api` | 是否在业务口挂 `/metrics` | `false` |
| `monitoring.metrics_basic_auth_*` | metrics Basic Auth | 可选 |
| `storage.deletion_retention` | 删除意图（deletion intent）保留时长 | 默认 `30d`；Docker 样例 `720h` |
| `forum.moderation.enabled` | 发帖后 AI 审核开关 | 默认 `false` |
| `ai_service.*` | 服务端 AI 提供商 | 按需 |

## Identity（摘要）

- `identity.enabled`：是否启用身份模块  
- `identity.oidc.*`：令牌 TTL、签发密钥等  
- `identity.social.providers`：社交登录（如 Ham）；字段为 camelCase  

完整字段见 `internal/platform/config` 与样例 `config/*.json`。

## Unknown 字段

拼写错误或已删除模块配置（例如 `weather`、`monitoring.host`）会报：

```text
unknown config field(s): ...
```

不会静默落到默认值。

> [!CAUTION]
> `server.calendar_data_dir` 属已删除字段（校历数据改由 `whucalendar` Go 包内嵌，见 [已移除与迁移](../meta/removed_and_migrated.md#校历数据卷与-calendar_data_dir2026-08-移除)）。旧配置文件中保留该键会触发未知字段校验并导致启动失败。

## 环境变量

| 变量 | 说明 |
|------|------|
| `CONFIG_PATH` | 配置文件路径（Compose 样例：`config/config.docker.json`） |
| `WATCHTOWER_HTTP_API_TOKEN` | Watchtower（若启用） |

## LUOTOPIA_* 运行时覆盖

`applyEnvironmentOverrides`（`internal/platform/config/env_overrides.go`）在配置文件与默认值**之后**应用显式运行时覆盖，适用于密钥与部署相关连接配置。仅当环境变量存在时生效。

| 变量 | 覆盖目标 |
|------|----------|
| `LUOTOPIA_ENVIRONMENT` | `environment` |
| `LUOTOPIA_EMAIL_TEMPLATE_DIR` | `server.email_template_dir` |
| `LUOTOPIA_STORAGE_ROOT_DIR` / `LUOTOPIA_STORAGE_PUBLIC_BASE` | `storage.root_dir` / `storage.public_base` |
| `LUOTOPIA_STORAGE_CLEANUP_RETENTION` / `LUOTOPIA_STORAGE_DELETION_RETENTION` | `storage.cleanup_retention` / `storage.deletion_retention`（Go duration，须为正值） |
| `LUOTOPIA_DATABASE_HOST` / `USER` / `PASSWORD` / `NAME` / `SSLMODE` | `database.*`（`sslMode` 为 camelCase） |
| `LUOTOPIA_REDIS_URL` / `LUOTOPIA_REDIS_PASSWORD` | `cache.redis_url` / `cache.redis_password` |
| `LUOTOPIA_JWT_SECRET` | `security.jwt_secret` |
| `LUOTOPIA_OIDC_SIGNING_KEY` / `LUOTOPIA_OIDC_SIGNING_PRIVATE_KEY` | `identity.oidc.signingKey` / `signingPrivateKey` |
| `LUOTOPIA_SOCIAL_TOKEN_ENCRYPTION_KEY` | `identity.social.tokenStorage.encryptionKey` |
| `LUOTOPIA_ROOT_PASSWORD` | `identity.bootstrap.rootPassword` |
| `LUOTOPIA_ALTCHA_HMAC_SECRET` / `LUOTOPIA_POW_SECRET` | `identity.security.altchaHmacSecret` / `powSecret` |
| `LUOTOPIA_SMTP_HOST` / `USERNAME` / `PASSWORD` / `FROM` / `TIMEOUT` | `identity.email.*`（TIMEOUT 为 Go duration） |
| `LUOTOPIA_HAM_GATEWAY_TOKEN` | `ham.gateway_token` |
| `LUOTOPIA_BUS_PRIVATE_KEY` / `LUOTOPIA_BUS_PUBLIC_KEY` | `campus.bus.*` |
| `LUOTOPIA_MASTER_TIMETABLE_SNAPSHOT_DIR` / `SESSION_ENCRYPTION_KEY` / `JWGL_TIMEOUT` | `campus.master_timetable.*` |
| `LUOTOPIA_FCM_ENABLED` / `SERVICE_ACCOUNT_FILE` / `SERVICE_ACCOUNT_JSON` / `ENDPOINT` | `push.fcm.*` |
| `LUOTOPIA_SOCIAL_<ID>_CLIENT_ID` / `CLIENT_SECRET` / `TOKEN_STORAGE_ENABLED` | 对应 `identity.social.providers` 条目（`<ID>` 为 provider ID 大写，`-`、`.`、空格转 `_`） |
| `LUOTOPIA_AI_<NAME>_API_KEY` | 对应 `ai_service.providers` 条目（`<NAME>` 规则同上） |

完整清单以 `env_overrides.go` 为准。

## 生产检查清单

1. 密钥不进 git（含 `credentials.txt`）  
2. `public_base` 用 `https://`  
3. Metrics 不裸奔公网  
4. 库名 / Redis / 端口与编排一致  
5. 共享存储卷按 [Docker · 多实例存储要求](./docker.md#多实例存储要求) 配置（多实例部署时）  

## 相关

- [Docker](./docker.md)
- [监控](./monitoring.md)
- [安全策略](../architecture/security_policy.md)
