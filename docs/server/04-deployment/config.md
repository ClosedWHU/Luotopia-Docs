# 配置手册 (Configuration Guide)

Luotopia Server 的所有配置项都通过 `config/config.json` 或环境变量进行管理。

## 1. 核心配置项

### 1.1 `server` (基础服务)
- `port`: 服务监听端口（默认 8080）。
- `read_timeout`: HTTP 读取超时时间。
- `write_timeout`: HTTP 写入超时时间。

### 1.2 `database` (数据库)
- `host`: 数据库主机。
- `port`: 数据库端口（5432）。
- `user`/`password`: 认证凭据。
- `dbname`: 数据库名称。
- `ssl_mode`: 是否启用 SSL（开发环境建议 `disable`）。

### 1.3 `redis` (缓存)
- `addr`: Redis 地址（host:port）。
- `password`: 认证密码。
- `db`: 使用的数据库索引。

### 1.4 `security` (安全)
- `jwt_secret`: 用于签署 JWT Token 的密钥（生产环境必须修改且保密）。
- `api_key_enabled`: 是否启用 API Key 认证。
- `sensitive_words`: 违禁词列表文件路径。

### 1.5 `sso` (单点登录)
- `enabled`: 是否启用 SSO。
- `issuer`: OIDC 发行者 URL。
- `client_id`/`client_secret`: 客户端凭据。

## 2. 环境变量覆盖
配置文件中的任何项都可以通过环境变量覆盖。格式为 `APP_` 前缀加上全大写的配置路径（下划线连接）。

例如：
- `APP_SERVER_PORT` 覆盖 `server.port`。
- `APP_DATABASE_PASSWORD` 覆盖 `database.password`。

## 3. 多环境支持
可以根据部署环境创建不同的配置文件：
- `config.development.json`
- `config.production.json`

在启动时通过命令行参数指定：
```bash
go run cmd/main.go serve -config config/config.production.json
```
