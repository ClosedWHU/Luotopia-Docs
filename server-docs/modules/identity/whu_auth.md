---
title: 武大身份说明（Ham 与教务 CAS）
slug: whu-auth
sidebar_label: 武大身份说明
sidebar_position: 8
---

以下两条链路相互独立，勿混淆。

## 1. Ham 社交登录（服务端 identity）

Luotopia **账号**可通过配置的社交提供商 **Ham**（武汉大学另一款校园应用）绑定 / 登录（`identity.social.providers` 中 `id: ham`），以 Ham 账号作为社交登录源。

- 协议：OAuth2 / OIDC 风格跳转 → code → token → userinfo
- 实现：`internal/domains/identity`（如 `ham_client.go`、社交登录 handler）
- 结果：建立 **Luotopia 用户会话 / JWT**，不是武大教务 Cookie

配置字段以 `IdentitySocialProvider` 为准（如 `clientId`、`authorizationEndpoint` 等 camelCase JSON），不是过时文档里的 `client_id` 随意写法。

## 2. 武大统一身份认证（CAS）/ 教务（客户端 whu_auth）

课表导入、空闲教室用教务数据、图书馆、场馆等**依赖武大个人会话**的能力：

- 在 **Flutter App** 的 `whu_auth` 中完成
- Cookie / Token **只在设备本地**，服务端**不接收、不存储、不转发**武大密码或教务 Cookie

详见：

- 客户端：[校园页教务认证](pathname:///client/campus-whu-auth)
- 服务端边界：[校园边界](../campus_proxies.md)

## 3. 已不成立的旧描述

以下旧说法不成立：

| 旧说法 | 事实 |
|------|------|
| 服务端用 Ham access_token 代用户爬教务课表 | Ham 登录只建立 Luotopia 会话，与教务无关 |
| 服务端存在 `whu_auth` 模块路径 | `whu_auth` 是 App 侧能力，服务端没有同名包 |
| 把 CAS 与 Ham 混成同一套「强认证代办校园业务」 | 两条链路相互独立（见上） |

## 4. ham-gateway（可选）

`ham.gateway_url` 指向的 **ham-gateway** 用于部分**只读**外部数据补充（例如课程给分大盘统计），与教务登录会话无关。网关未部署时相关补充失败，不应拖垮主业务。

## 相关

- [身份认证模块](./index.md)
- [租户与社交登录](./tenant.md)
- [校园边界](../campus_proxies.md)
