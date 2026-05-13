# 基础设施与平台底座

`internal/platform` 模块是整个系统的基石，提供了所有业务模块共享的基础能力。

## 1. 核心子文档
- **[数据库与 ORM](../../01-architecture/overview.md)**: 数据库连接池、GORM 配置及实体建模。
- **[日志与审计](./logging.md)**: 基于 Zap 的结构化日志规范与管理员审计。
- **[国际化服务](./translation.md)**: 多语言字典加载与 Fallback 逻辑。
- **[可观测性](../../04-deployment/monitoring.md)**: Prometheus 指标采集与健康检查。
- **[安全机制](../../01-architecture/security_policy.md)**: 认证、鉴权及防御策略。

## 2. 核心功能点
- **配置管理**: 基于 `config.json` 的全局配置中心。
- **缓存抽象**: 统一的 Redis/内存缓存接口。
- **错误处理**: 自动化的错误码转换与 Huma API 适配。
- **任务分发**: 异步任务 Worker 及其状态监控。

## 3. 设计原则
- **解耦**: 平台层代码不依赖于任何业务模块。
- **鲁棒性**: 所有基础服务（DB, Redis）在初始化时均有严格的连接重试与健康检查机制。
