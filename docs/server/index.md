---
slug: /server/
title: 文档中心
---

# 文档中心

欢迎来到 Luotopia Server 开发文档。本文档旨在帮助开发者了解系统架构、快速上手开发并进行生产部署。

## 导航地图

### 1. [核心架构](./01-architecture/overview.md)
- [系统架构概览](./01-architecture/overview.md): 模块化单体设计原则与组件关系。
- [数据库设计](./01-architecture/database_design.md): 核心实体 E-R 图与 GORM 建模规范。
- [安全策略](./01-architecture/security_policy.md): 鉴权、敏感词过滤与速率限制。

### 2. [开发指南](./02-development/setup.md)
- [环境搭建](./02-development/setup.md): Go, PostgreSQL, Redis 配置。
- [测试手册](./02-development/testing.md): 单元测试、集成测试与自动化流程。
- [贡献指南](./02-development/contributing.md): 代码风格、Git 工作流与 PR 规范。

### 3. [接口文档](./03-api/overview.md)
- [API 使用指南](./03-api/overview.md): 认证方式、Base URL 与调试建议。
- [详细接口列表](./03-api/detailed_reference.md): 业务场景与接口调用指南。
- [错误码规范](./03-api/error_codes.md): 系统全局错误定义。
- **[Huma/OpenAPI UI]**: 运行服务后访问 `/docs` 或 `/scalar` 即可查看由 Huma 自动生成的交互式 API 文档。

### 4. [运维部署](./04-deployment/config.md)
- [配置中心](./04-deployment/config.md): 全局 JSON 配置项详解。
- [Docker 部署](./04-deployment/docker.md): 开发环境启动与镜像构建。
- [CI/CD 流程](./04-deployment/cicd.md): 自动化测试与持续交付说明。
- [监控与审计](./04-deployment/monitoring.md): Prometheus 指标与后台审计日志。

### 5. [模块详解](./05-modules/index.md)
- [身份认证](./05-modules/identity/index.md)
- [论坛社区](./05-modules/forum/index.md)
- [课程服务](./05-modules/course/index.md)
- [统一搜索](./05-modules/search/index.md)
- [内部服务](./05-modules/services/index.md)（搜索引擎、内容审核、集成测试）
- [基础设施](./05-modules/platform/index.md)

### 6. [高级主题](./advanced/)
- [CLI 命令参考](./cli_reference.md): 完整的命令行工具使用指南。
- [性能调优指南](./performance_tuning.md): 数据库、缓存、搜索优化策略。

---
*上次更新: 2026-05-13*
