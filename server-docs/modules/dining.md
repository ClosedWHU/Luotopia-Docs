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
| 营业信息 | 营业时间与排期例外（节假日调整等） |
| 发现 | 随机档口、推荐列表、关键词搜索、聚合快照（供客户端缓存） |
| 评价 | 档口评价（每用户一份，可更新 / 删除）、评价反应与举报 |
| 菜品互动 | 菜品反应（赞 / 踩）与菜品评论 |
| 投稿 | 用户提交食堂数据（新档口 / 菜单等），经管理员审核后生效 |

## 端点组（注册级）

用户端均需登录（Bearer）：

| 组 | 路径示例 |
|------|------|
| 区域 / 楼宇 / 楼层 | `GET /areas`、`/buildings`、`/buildings/{id}/floors`、`/floors/{id}/plan` |
| 档口与菜单 | `GET /spots`、`/spots/{id}`、`/spots/{id}/menu`、`/spots/{id}/menu-groups`、`/spots/{id}/business-hours`、`/spots/{id}/schedule-exceptions` |
| 推荐与搜索 | `GET /spots/random`、`/recommendations`、`/search`、`/snapshot`、`/recommendation-snapshot` |
| 评价 | `GET /spots/{id}/reviews`、`POST/DELETE /spots/{id}/review`、`POST /reviews/{id}/report`、`POST /reviews/{id}/reaction` |
| 菜品互动 | `GET /menu-items/{id}/comments`、`POST /menu-items/{id}/comment`、`POST /menu-items/{id}/reaction`、`DELETE /menu-comments/{id}` |
| 投稿 | `POST /submissions` |

### 管理端

`/api/v1/dining/admin/*`（Admin Access + 权限码 `dining:manage`，见 [安全策略](../architecture/security_policy.md)）：

- 记录创建 / 更新：区域、楼宇、楼层、档口、菜单分组、菜品、楼层平面图、营业时间与排期例外
- 审核队列：投稿、评价举报、质量问题清单
- 数据治理：档口 / 楼宇合并
- 区域同步：`POST /admin/areas/sync-tencent`（从腾讯位置服务同步武汉行政区；API Key 由请求方提供，不在服务端文档中存放）

## 数据与边界

- 空间与菜单数据以管理员维护 + 用户投稿审核为主；外部同步仅覆盖行政区基础数据。
- 评价为「一档口一用户一份」（upsert）；本人可删除，举报与审核走管理端。
- 推荐与搜索的排序策略为实现细节；客户端依赖接口语义，不依赖固定公式。
- 快照接口（`/snapshot`、`/recommendation-snapshot`）返回带版本号的聚合数据，供客户端离线缓存。

## 相关

- [模块详解](./index.md)
- [API 接口参考（摘要）](../api/full_reference.md)
- [校园边界](./campus_proxies.md)
