# 可观测性与监控

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
- **搜索服务**: PostgreSQL 全文搜索（PgSearch）的查询耗时及结果计数。
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

## 4. 深度监控指标规范 (Deep Monitoring Specifications)
 
Luotopia 的监控体系深入关键业务链路，由 `MonitoringManager` 统一调度。
 
### 4.1 核心性能指标
- **数据库查询耗时 (`db_query_duration_seconds`)**: 
    - 标签: `operation` (读/写/更新/删除), `table` (posts/users 等)。
    - **实现价值**: 该指标支持精准定位特定业务表的操作瓶颈，为数据库索引优化提供量化依据。
- **缓存命中率 (`cache_operations_total`)**: 
    - 标签: `type` (redis/memory), `hit` (true/false)。
    - **分析价值**: 实时监测缓存效率，及时预警缓存穿透或大 Key 导致的性能抖动。
 
### 4.2 外部服务与异步链路
- **外部 API 延迟 (`external_api_call_duration_seconds`)**: 
    - 标签: `service` (Gemini/OpenAI), `endpoint`。
    - **监控价值**: 实时观测第三方 AI 接口及校园网关代理的可用性与延迟波动。
- **异步任务积压**: 监控 Worker 队列的入队/出队速率，防止高并发场景下 AI 预审等异步任务发生严重积压。
 
### 4.3 监控采集机制
系统采用 **Pull + Push** 结合的混合采集模式：
1. **主动埋点**: 在 Service 与 Repository 层通过 `RecordDatabaseQuery` 实时捕捉低时延操作。
2. **定时轮询**: `MonitoringManager` 定期汇总静态业务统计（如总用户数、待审申请数）。
3. **资源隔离**: 监控模块通过 `internal/platform/monitoring` 独立管理其指标库，确保监控逻辑的异常不会干扰核心业务链路。

## 5. 常见问题 (FAQ)

**Q: 如何在 Grafana 中可视化这些数据？**
A: 我们在 `deployment/monitoring/grafana/` 目录下提供了预定义的 Dashboard 模板，您可以直接导入。

**Q: 开启全量监控是否会显著降低系统性能？**
A: 不会。Prometheus 指标的更新在内存中完成，仅涉及简单的计数器或直方图累加操作，对业务逻辑的 CPU 开销占比小于 0.5%。

---
[返回目录](../index.md)
