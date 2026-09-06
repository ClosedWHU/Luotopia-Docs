---
title: 武大认证边界
slug: whu-auth
sidebar_label: 武大认证边界
sidebar_position: 8
---


请区分两条完全不同的链路。

## 1. HAM 社交登录（服务端 identity）

Luotopia **账号** 可通过配置的社交提供商 **HAM** 绑定/登录（`identity.social.providers` 中 `id: ham`）。

- 协议：OAuth2 / OIDC 风格跳转 → code → token → userinfo  
- 实现：`internal/domains/identity`（如 `ham_client.go`、社交登录 handler）  
- 结果：建立 **Luotopia 用户会话 / JWT**，不是武大教务 Cookie  

配置字段以 `IdentitySocialProvider` 为准（如 `clientId`、`authorizationEndpoint` 等 camelCase JSON），不是过时文档里的 `client_id` 随意写法。

## 2. 武大 CAS / 教务（客户端 whu_auth）

课表导入、空闲教室用教务数据、图书馆、场馆等 **依赖武大个人会话** 的能力：

- 在 **Flutter App** 的 `whu_auth` 中完成  
- Cookie / Token **只在设备本地**，服务端 **不接收、不存储、不转发** 武大密码或教务 Cookie  

详见：

- 客户端：[校园页教务认证](pathname:///client/campus-whu-auth)  
- 服务端边界：[校园边界](../campus_proxies.md)

## 3. 已不成立的旧描述

- ❌ 服务端用 HAM access_token **代用户爬教务课表**  
- ❌ 服务端 `whu_auth` 模块路径（服务端没有 App 同名包）  
- ❌ 把 CAS 与 HAM 混成同一套「强认证代办校园业务」

## 4. ham-gateway（可选）

`ham.gateway_url` 指向的 **ham-gateway** 用于部分 **只读** 外部数据补充（例如课程给分大盘统计），与教务登录会话无关。网关未部署时相关补充失败，不应拖垮主业务。

---
[返回 identity 目录](./index.md)
