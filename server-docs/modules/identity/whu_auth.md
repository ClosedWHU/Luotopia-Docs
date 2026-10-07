---
title: 武大身份说明（Ham 与教务 CAS）
slug: whu-auth
sidebar_label: 武大身份说明
sidebar_position: 8
---

以下两条链路相互独立，勿混淆。

## 1. Ham 社交登录（服务端 identity）

Luotopia 账户可绑定社交提供商 Ham（武汉大学另一款校园应用）并用它登录，Ham 账户即社交登录源。提供商在 `identity.social.providers` 中配置，Ham 对应 `id: ham`。

- 协议：OAuth2 / OIDC 风格跳转 → code → token → userinfo
- 实现：`internal/domains/identity`（社交登录 handler / `service/oidc_flow.go`）；Ham 评分客户端（读大盘 + 写成绩贡献）在 `course_review/client/ham.go`
- 结果：建立 Luotopia 用户会话 / JWT，不是武大教务 Cookie

配置字段以 `IdentitySocialProvider` 为准（如 `clientId`、`authorizationEndpoint` 等 camelCase JSON）；过时文档中的 `client_id` 写法已不适用。

## 2. 武大统一身份认证（CAS）/ 教务

课表导入、空闲教室的教务数据、图书馆与场馆等能力依赖武大个人会话，主路径在 Flutter App 的 `whu_auth` 中完成。Cookie / Token **只在设备本地**。

服务端**一次性核验**武大会话/票据，不持久化会话。注册与绑定同时支持本科 jwgl 与研究生 newyjs 两个渠道，由 `cas_service` 选择器切换（`undergraduate` / `graduate`）：

- 评价资格同步：`POST /api/v1/user/review-eligibility/sync` 需 `cas_ticket` 和 `captcha_token`，由 `course_review/client/jwgl.go` 消费票据核验成绩。
- 主课表贡献：`POST /api/v1/timetable/master/import-jobs` 接受 CAS `ticket`。
- 武大绑定 / 解绑：`POST /api/v1/auth/whu/bind`、`POST /api/v1/auth/whu/unbind`。
- 注册授权：`POST /api/v1/user/register/whu/authorize` 需 `cas_cookie_header`；服务端**瞬时接收** CAS 会话 Cookie 用于邮箱验证，不保存。

详见：

- 客户端：[校园页教务认证](pathname:///client/campus-whu-auth)
- 服务端边界：[校园边界](../campus_proxies.md)

## 3. 已不成立的旧描述

| 旧说法 | 事实 |
|------|------|
| 服务端用 Ham access_token 代用户爬教务课表 | Ham 登录只建立 Luotopia 会话，与教务无关 |
| 服务端存在 `whu_auth` 模块路径 | `whu_auth` 是 App 侧能力，服务端没有同名包 |
| 把 CAS 与 Ham 混成同一套「强认证代办校园业务」 | 两条链路相互独立（见上） |

## 4. ham-gateway（可选）

`ham.gateway_url` 指向的 ham-gateway 用于外部数据交互（读大盘统计 + 写成绩贡献 `ContributeScores`），与教务登录会话无关。网关未部署时相关读写失败，不应拖垮主业务。

## 相关

- [身份认证模块](./index.md)
- [租户与社交登录](./tenant.md)
- [校园边界](../campus_proxies.md)
