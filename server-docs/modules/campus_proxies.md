---
title: 校园服务边界
slug: campus-proxies
sidebar_label: 校园边界
description: 哪些走 App 直连，哪些走 Luotopia 服务端
sidebar_position: 10
---

## 原则

| 类型 | 谁来做 |
|------|--------|
| 需要**武大个人会话**（CAS / 教务 / 馆 / 场馆 Cookie 或 Token） | **仅 App**（`whu_auth` 等） |
| Luotopia 自有业务（账号、论坛、评价、通知…） | **服务端** |
| 可公开、无个人校园凭据的数据 | 可服务端代理，但须限流 / 缓存 / 说明来源 |

服务端 **不接收、不保存、不转发** 武大密码或教务 Cookie。不要新增依赖这类凭据的 `/api/v1` 接口。

## 服务端校园域在做什么

`internal/domains/campus/*` 例如：

- 课表主数据 / 用户课表 API（非「代你爬教务」）
- 日历 ICS
- 空闲教室数据查询（数据源以实现为准）

个人课表 **导入** 仍在 App 完成。

## 明确不在业务服的能力

| 能力 | 实际位置 |
|------|----------|
| 安装包发布 / 检查更新 | 官网 homepage Pages Functions + GitHub Releases |
| 解析脚本热更新 | 官网静态 `/hot-update/` |
| 天气 | App 直连第三方（见 [weather](./weather.md)） |
| 校巴实时到站 | App + 上游数据（`campus_bus`），非代持武大会话爬取 |

客户端说明：[更新与热更新](pathname:///client/updates)、[校园功能](pathname:///client/campus)。

## 相关

- [用户：武大 vs 珞家账号](pathname:///user/accounts)
- [Ham 与教务](./identity/whu_auth.md)
- [课表模块](./timetable.md)
- [系统模块边界](./system.md)
