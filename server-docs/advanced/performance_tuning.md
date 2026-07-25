---
sidebar_position: 1
title: 性能调优指南
sidebar_label: 性能调优
description: 数据库、缓存与服务端通用调优原则
---
# 性能调优指南

通用原则。**连接池数值、索引 DDL、缓存 TTL 以配置与代码为准**；下列为建议，勿不经评估照搬生产。

搜索索引初始化见 `domains/search` 与 [搜索索引](../modules/search/indexing.md)。

## 1. 数据库

| 方向 | 建议 |
|------|------|
| 索引 | 为高频 WHERE / JOIN / ORDER BY 建索引；避免盲目堆索引拖慢写入 |
| N+1 | 用 JOIN、批量预加载，避免循环内单条查 |
| 连接池 | 配置 max open / idle / lifetime；监控等待连接数 |
| 分析 | 用慢查询日志与 `ANALYZE`；具体诊断 SQL 放内部 runbook |

## 2. 缓存

| 方向 | 建议 |
|------|------|
| 分层 | 进程内短 TTL → Redis → DB（按业务需要，非强制三层） |
| 失效 | 写路径主动删缓存，或短 TTL + 可接受短暂不一致 |
| Key | 命名与 TTL 为实现细节，非公开 API 契约 |
| 热点 | 防击穿/穿透策略以实现为准，不在此规定固定阈值 |

## 3. HTTP 与业务

- 强制分页与合理 `limit` 上限。  
- 昂贵接口限流（默认 IP 配额 + 按操作 `httpapi.Op.Rate`；见 [HTTP 注册规范](../api/httpapi.md)）。  
- 避免在请求路径做全表扫描式搜索词。  

## 4. 搜索

- 依赖 FTS 索引与扩展是否就绪。  
- 宽查询词 + 大 limit 是常见慢因。  
- 详见 [搜索服务](../modules/services/search_engine.md)。  

## 5. 监控（指标类型）

关注：延迟分位、错误率、DB 连接占用、缓存命中率、搜索延迟。  
具体 metric 名与 Prometheus 规则以实现与 [监控](../deployment/monitoring.md) 为准。

压测仅在**自有 staging** 对非生产数据执行；文档不提供针对公网实例的压测脚本。

## 6. 常见问题

| 问题 | 方向 |
|------|------|
| N+1 / 连接打满 | 批量查询、池参数、慢查询 |
| 缺索引 | 慢查询分析后补索引 |
| 缓存失效风暴 | 失效粒度、TTL、互斥重建 |
| 搜索超时 | 缩小 scope、分页、检查索引 |

---

[返回开发指南](../development/)
