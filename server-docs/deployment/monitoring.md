---
title: 监控与 Metrics
sidebar_label: 监控
description: Prometheus 独立端口、鉴权与配置
sidebar_position: 4
---

实现：`internal/platform/monitoring`。

## 暴露方式

| 方式 | 默认 |
|------|------|
| 独立监听 `metrics_host`:`metrics_port` 上的 `/metrics` | **开**（host 默认 `127.0.0.1`） |
| 业务 API 上的 `/metrics` | **关**（`expose_metrics_on_api=false`） |
| Basic Auth | 用户名+密码都非空时启用 |

## 配置

| 字段 | 说明 | 默认 |
|------|------|------|
| `metrics_host` | 绑定地址 | `127.0.0.1` |
| `metrics_port` | 端口（可自定义） | `9090` |
| `enable_metrics_server` | 是否起独立服务 | `true` |
| `expose_metrics_on_api` | 是否挂主 API | `false` |
| `metrics_basic_auth_user` / `_password` | Basic Auth | 空 |
| `worker.metrics_port` | worker 覆盖端口 | 可选 |

Docker 内给 Prometheus scrape：容器内用 `metrics_host: "0.0.0.0"`，**不要**默认把端口映射到公网；需要本机调试再用 `127.0.0.1:9090:9090`。

## Prometheus 示例

```yaml
scrape_configs:
  - job_name: luotopia
    static_configs:
      - targets: ['localhost:9090']  # 与 metrics_port 一致
    # basic_auth:
    #   username: metrics
    #   password: replace-me
```

## 指标类型（摘要）

以实际导出为准，常见包括：

- HTTP：请求数、延迟  
- DB / Redis / 缓存  
- Worker 队列  
- 部分业务与安全计数  

指标名可能随版本变化，以 `/metrics` 输出为准。

## 相关

- [配置手册](./config.md)
- [安全策略](../architecture/security_policy.md)
