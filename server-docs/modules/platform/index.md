---
title: 基础设施与平台底座
sidebar_label: 概览
sidebar_position: 0
---

路径：`server/internal/platform/`。

## 常见能力

| 包 | 职责 |
|----|------|
| `config` | 配置加载、校验（含 unknown 字段）、默认值 |
| `database` | GORM / Postgres 初始化、扩展、bootstrap |
| `cache` | Redis 客户端 |
| `http` | 健康检查、欢迎页等 |
| `monitoring` | Prometheus 指标、独立 metrics 端口、可选 Basic Auth |
| `security` | 敏感词等横切能力 |

## 相关

- [日志规范与审计](./logging.md)
- [配置手册](../../deployment/config.md)
- [监控](../../deployment/monitoring.md)
- [安全策略](../../architecture/security_policy.md)
- [模块详解](../index.md)

