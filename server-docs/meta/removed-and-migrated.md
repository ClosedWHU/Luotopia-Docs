---
title: 已移除与迁移项
sidebar_label: 已移除与迁移
sidebar_position: 4
description: 服务端不应再使用的协议、服务与运行入口
---

# 已移除与迁移项

本文集中记录服务端的废弃协议、未落地能力与迁移规则。新代码与外部对接应使用「当前替代」。

## 全站请求 HMAC

| 旧做法 | 当前替代 |
|--------|----------|
| `X-Api-Sign` / `X-Api-Ts` 全站签名 | HTTPS + Bearer JWT / Session / 用户级 API 凭证 |

业务服不再校验全站请求 HMAC；不得要求移动端硬编码全局 `api_secret`。

## 独立 migrate 命令与全量 schema SQL

| 旧预期 | 当前方式 |
|--------|----------|
| 顶层 `migrate` 子命令 | 启动 `serve` / `worker` 触发 `database.InitDB()` / AutoMigrate |
| 仓库维护全量 schema SQL | 模型 + AutoMigrate；高风险重命名/删列由受控 SQL 处理 |

详见 [数据库迁移](../architecture/migrations.md)。

## 平台翻译服务

`internal/platform/translation` 与顶层 `translation` 配置不再存在。服务端错误文本以 handler / 错误中间件为准；客户端本地化由 Flutter l10n 负责。

## 尚未落地的 chat 域

当前无 `internal/domains/chat`，不要依赖 `/api/v1/chat/*` 或历史 WebSocket 私聊说明。状态页见 [即时通讯](../modules/chat.md)。

## 官网更新与热更新不属于 system 主路径

安装包更新与解析脚本热更新由官网 homepage 提供；`system` 域不作为 Flutter 主分发路径。见 [官网与外部面](../modules/external_surfaces.md)。

## 相关

- [安全策略](../architecture/security_policy.md)
- [公开文档边界](./public_docs_policy.md)
