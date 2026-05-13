# 配置手册

Luotopia Server 的所有配置项都通过 `config/config.json` 或环境变量进行管理。系统启动时会加载该文件并映射到内部配置模型。

## 1. 核心配置参考 (Core Settings)

| 配置项 | 说明 | 示例/默认值 |
| :--- | :--- | :--- |
| `environment` | 运行环境标识 | `dev`, `prod`, `test` |
| `server.port` | HTTP 服务监听端口 | `8080` |
| `server.public_base` | 外部访问的基础 URL (用于生成链接) | `http://api.whu.sb` |
| `database.host` | 数据库主机地址 | `localhost` |
| `database.user` | 数据库用户名 | `postgres` |
| `database.name` | 数据库名称 | `course_review` |
| `cache.redis_url` | Redis 连接字符串 (host:port) | `localhost:6379` |
| `security.jwt_secret` | JWT 签名密钥（生产环境必换） | `docker-local-jwt-secret` |
| `security.rate_limit` | 全局限流 QPS (每分钟) | `200` |
| `ai_service.default_provider` | 默认 AI 驱动提供商 | `openai` |

## 2. 身份中心配置 (Identity & SSO)
`identity` 模块控制系统的账号与认证逻辑。

- **`identity.enabled`**: 是否启用内置 SSO 服务。
- **`identity.oidc`**: 包含 OIDC 协议参数，如 `accessTokenTTL` (Token 有效期)。
- **`identity.social`**: 第三方登录（如 HAM, Google）的 ClientID 与 Secret。

## 3. 环境变量覆盖
配置文件中的任何项都可以通过环境变量覆盖。格式为 `APP_` 前缀加上全大写的配置路径（下划线连接）。

例如：
- `APP_SERVER_PORT` 覆盖 `server.port`。
- `APP_DATABASE_PASSWORD` 覆盖 `database.password`。

## 4. 生产环境安全建议

> [!CAUTION]
> 1. **密钥脱敏**: 严禁将包含生产环境 `jwt_secret` 或 `api_secret` 的配置文件提交到版本库。
> 2. **数据加密**: 确保 `security.api_secret` 已配置，用于加密存储三方登录的 Token。
> 3. **SSL/TLS**: 在生产环境中，`server.public_base` 必须使用 `https://`。

---
[返回目录](../index.md)
