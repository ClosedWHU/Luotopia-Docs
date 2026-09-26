---
title: 基础设施与平台底座
sidebar_label: 概览
sidebar_position: 0
---

路径：`server/internal/platform/`。

## 常见能力

| 包 | 职责 |
|----|------|
| `config` | 配置加载、校验（含 unknown 字段）、默认值与环境变量覆盖 |
| `database` | GORM / Postgres 初始化、扩展、迁移与 bootstrap（角色 / 权限 / 匿名用户 / root） |
| `cache` | Redis 客户端与限流配额 |
| `http` | 健康检查、欢迎页等 |
| `httpdto` | 跨域通用 HTTP DTO / 分页骨架 |
| `monitoring` | Prometheus 指标、独立 metrics 端口、可选 Basic Auth |
| `security` | 敏感词等横切安全能力 |
| `errors` | 对外错误统一转换（`platform/errors`） |
| `rbac` | 角色 / 权限模型 |
| `authz` | 授权判定 |
| `avatar` | 头像二进制存储 / 读取 |
| `storage` | 对象存储后端（上传 / 下载 / deletion-intent 生命周期） |
| `netx` | 网络相关横切工具 |
| `outboundhttp` | 受控外部 HTTP 客户端 |
| `servicecheck` | 依赖就绪 / 健康探测 |
| `timex` | 时间相关工具 |
| `weakpassword` | 弱密码检测 |

## 相关

- [日志规范与审计](./logging.md)
- [配置手册](../../deployment/config.md)
- [监控](../../deployment/monitoring.md)
- [安全策略](../../architecture/security_policy.md)
- [模块详解](../index.md)
