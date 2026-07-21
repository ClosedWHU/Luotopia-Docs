---
title: 官网与外部面
sidebar_label: 官网与外部面
description: homepage、GitHub Releases、与业务服的边界
sidebar_position: 1
---
# 官网与外部面

业务服（本仓库 `server/`）不是客户端唯一后端。下列「面」与 App 强相关，但代码/部署不在 `server` 进程内。

## 官网 homepage（`homepage/` → `www.whu.sb`）

| 路径 / 能力 | 类型 | 说明 |
|-------------|------|------|
| `/api/releases/latest` | Cloudflare Pages Function | 代理 GitHub Releases；`?prerelease=1` |
| `/api/releases/download/...` | Function | 同源下载代理 / 缓存 |
| `/hot-update/manifest.json` | 静态 | 热更新清单（Ed25519 签名） |
| `/hot-update/scripts/*.js` | 静态 | 解析脚本 |
| `/data/friend-links.json` 等 | 静态 | 友情链接、法律目录等 |
| `/legal/...` | 站点页 | 用户协议等 |

中间件强制主域（见 `functions/_middleware.ts`）。客户端 `AppConfig.siteBaseUrl` 指向该 origin。

## GitHub Releases

安装包由 CI 挂到公开 GitHub Releases（仓库名以部署配置为准）。官网 Function 通过**环境变量**读取 token 与仓库名——**文档与仓库中不得出现真实 token**。

## 与 `system` 域

`GET /api/v1/system/update` 等仍可能存在，**当前 Flutter 主路径不依赖它做装包分发**。远程 KV 配置仍可走 `system/config`。

## 文档入口

| 读者 | 文档 |
|------|------|
| 服务端 | [system](./system.md) · [校园边界](./campus_proxies.md) |
| 客户端 | [更新与热更新](pathname:///client/updates) |
| 用户 | [设置](pathname:///user/settings) · [FAQ](pathname:///user/faq) |

---
[返回模块总览](./index.md)
