# 可观测性与监控 (Observability)

Luotopia Server 内置了全面的监控体系，通过 Prometheus 收集多维度的性能指标。

## 1. 监控架构
系统通过 `internal/platform/monitoring` 包提供的 `PrometheusService` 统一管理所有指标。
- **采集端**: 服务器通过 `/metrics` 端点暴露数据。
- **独立服务**: 监控系统可以运行在独立端口（默认 9090），避免影响业务流量。

## 2. 指标分类
系统收集以下维度的指标：

### 2.1 HTTP 流量
- **请求计数**: `http_requests_total` (labels: method, path, status)
- **响应耗时**: `http_request_duration_seconds`

### 2.2 基础设施
- **数据库**: 连接池状态（active/idle）、查询耗时、操作分布（select/insert 等）。
- **Redis**: 内存占用、连接数、命令执行频率及耗时。
- **缓存**: 缓存命中率（hit/miss）分类型统计。

### 2.3 业务指标
- **课程业务**: `business_courses_total`, `business_reviews_total`, `business_users_total`。
- **搜索服务**: 不同引擎（PgSearch/Meili）的搜索耗时及结果计数。
- **翻译服务**: 翻译请求量、源/目标语言分布。

### 2.4 系统与安全
- **系统状态**: CPU 使用率、内存占用、磁盘空间、负载 (Load Average)。
- **安全事件**: 暴力破解拦截、非法签名请求。
- **任务处理**: Worker 队列长度、任务处理耗时。

## 3. 如何配置 Prometheus
在 `prometheus.yml` 中添加以下任务：

```yaml
scrape_configs:
  - job_name: 'luotopia-server'
    static_configs:
      - targets: ['localhost:9090']
```

## 4. 日志审计 (Audit Logging)
除了 Prometheus 指标，系统还提供：
- **操作日志**: 存储在数据库 `admin_logs` 表，记录所有管理行为。
- **结构化日志**: 使用 `zap` 输出 JSON 格式日志，便于接入 ELK/Loki。
