---
title: 天气（客户端直连）
sidebar_label: 天气（无服务端）
description: 服务端无天气模块；App 直连第三方
sidebar_position: 17
---

## 状态

服务端无此模块：

- 无 `internal/weather`、无 `/api/v1/weather/*`
- 配置里写 `weather` 会因 **unknown 字段** 启动失败

天气由 **Flutter 客户端**直连第三方（OpenMeteo / 小米 / AccuWeather 等），本地缓存与重试。

## 可选后续

若需在服务端收敛第三方 API Key 或统一限流，可再引入服务端代理——**非当前规划**。

## 相关

- [用户指南 · 天气设置](pathname:///user/settings)
- [校园边界](./campus_proxies.md)
- [模块详解](./index.md)
