---
title: 食堂服务
sidebar_label: 食堂
description: 食堂区域、楼宇楼层、档口、菜单、评价与投稿
sidebar_position: 4
---

代码：`internal/domains/dining`。路径前缀：`/api/v1/dining`（OpenAPI Tag `Dining`）。

食堂域提供校内餐饮数据的结构化查询（区域 → 楼宇 → 楼层 → 档口 → 菜单）与用户互动能力（评价、反应、评论、投稿）。**字段与完整路径以 OpenAPI 为准**；本文只做能力级摘要。

## 能力

| 能力 | 说明 |
|------|------|
| 空间结构 | 区域（校区 / 行政区）、楼宇、楼层与楼层平面图（含平面图要素） |
| 档口 | 档口列表 / 详情，按区域与范围过滤 |
| 菜单 | 档口菜单分组与菜品 |
| 营业信息 | 营业时间与排期例外（节假日调整等）；含 `Closed` 停业标记，查询时返回计算后的 `open` 布尔 |
| 发现 | 随机档口、推荐列表、关键词搜索、聚合快照（供客户端缓存）；推荐可被 `SpotBan` 屏蔽 |
| 评价 | 档口评价（每用户一份，可更新 / 删除）、评价反应与举报 |
| 菜品互动 | 菜品反应（赞 / 踩）与菜品评论 |
| 投稿 | 用户提交食堂数据（新档口 / 菜单等），经管理员审核后生效；审核结果结算论坛声望（贡献奖励） |

## 端点与权限

用户端均需登录（Bearer）；管理端 `/api/v1/dining/admin/*`（Admin Access）。完整端点列表见[食堂接口参考](../api/dining.md)与[管理后台接口参考](../api/admin.md)。

管理端按能力细分权限码（见 [安全策略](../architecture/security_policy.md)）：

| 权限码 | 范围 |
|--------|------|
| `dining:manage` | 目录 / 数据治理：区域、楼宇、楼层、档口、菜单分组、菜品、平面图、营业时间、排期例外、别名、合并、`SpotBan`、`sync-tencent`、奖励策略 |
| `dining:moderate` | 审核：投稿、评价、举报、贡献撤销 |

区域同步：`POST /admin/areas/sync-tencent`（从腾讯位置服务同步武汉行政区；API Key 由请求方提供，不在服务端文档中存放）。

## 数据与边界

- 空间与菜单数据以管理员维护 + 用户投稿审核为主；外部同步仅覆盖行政区基础数据。
- 评价为「一档口一用户一份」（upsert）；本人可删除，举报与审核走管理端。
- 投稿审核结果会结算论坛声望（`dining_contribution`），经论坛侧统一结算，避免重复入账（见 [论坛声望](./forum/karma.md)）。
- `SpotBan` 用于从推荐中屏蔽档口（质量治理），`recommendation-snapshot` 响应含 `bans`。
- 停业用 `BusinessHour.Closed` / `ScheduleException.Closed` 表达，查询端返回计算后的 `open` 布尔；`AreaClosure` 是层级闭包表，非业务停业概念，勿混淆。
- 推荐与搜索的排序策略为实现细节；客户端依赖接口语义，不依赖固定公式。
- 快照接口（`/snapshot`、`/recommendation-snapshot`）返回带版本号的聚合数据，供客户端离线缓存；版本由 `dining_snapshot_state` 持久化表 + DB 触发器推进。

## 相关

- [模块详解](./index.md)
- [食堂接口参考](../api/dining.md)
- [校园边界](./campus_proxies.md)
