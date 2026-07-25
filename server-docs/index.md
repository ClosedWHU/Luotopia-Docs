---
id: index
slug: /
sidebar_position: 0
title: 服务端开发文档
sidebar_label: 概览
description: Go 后端：架构、开发、API、部署与模块
---
# 服务端开发文档

Go 模块化单体（Huma + Gin + Postgres + Redis）。入口：`serve` | `worker` | `cli`。

**字段级 API 以 OpenAPI 为准。**

其它分区：[用户指南](pathname:///user/) · [客户端开发](pathname:///client/)

> **边界提示**：App 的 **安装包更新 / 热更新脚本 / 天气** 主路径在官网或第三方，不在本仓库业务 API。见 [system](./modules/system.md)、[校园边界](./modules/campus_proxies.md)。

## 先读

| 目的 | 文档 |
|------|------|
| 本地跑起来 | [环境搭建](./development/setup.md) |
| 鉴权 | [安全策略](./architecture/security_policy.md) |
| 调 API | [API 使用指南](./api/overview.md) |
| Docker | [Docker 部署](./deployment/docker.md) |
| 配置 | [配置手册](./deployment/config.md) |
| 校园谁做什么 | [校园边界](./modules/campus_proxies.md) |
| 官网 / Releases / 热更新 | [官网与外部面](./modules/external_surfaces.md) |

## 侧栏结构（自上而下）

1. **概览**（本页）  
2. **系统架构** → 概览 / 库表 / 安全 / 迁移  
3. **开发指南** → 环境 / 测试 / 贡献  
4. **接口文档** → 使用指南 / [HTTP 注册规范](./api/httpapi.md) / 调用摘要 / 接口参考 / 错误码（**以 OpenAPI 为准**）  
5. **运维部署** → 配置 / Docker / CI/CD / 监控 / 构建  
6. **模块详解** → 身份、论坛、课程、搜索、校园边界、官网面、内部服务…  
7. **CLI 参考**  
8. **高级主题** → 性能调优  
9. **规范与社区** → 风格 / [公开文档边界](./meta/public_docs_policy.md) / [已移除与迁移](./meta/removed-and-migrated.md) / 贡献  

模块入口：[模块详解](./modules/index.md)
