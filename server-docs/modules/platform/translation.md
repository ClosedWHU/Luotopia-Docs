---
title: 翻译与 i18n 状态
sidebar_label: 翻译与 i18n
sidebar_position: 2
---

## 当前代码

`internal/platform` **下没有** `translation` 包或 `dicts/*.json` 字典目录。  
配置项顶层 `translation` 也不是合法 `Config` 字段（unknown 字段校验会失败）。

API 错误文案与本地化：

- 服务端：以 handler / 统一错误中间件返回为准  
- 客户端：Flutter `l10n`（`app/lib/core/l10n`）

平台翻译服务的迁移说明见 [已移除与迁移](../../meta/removed_and_migrated.md#平台翻译服务)。

## 相关

- [基础设施与平台底座](./index.md)
- [错误码](../../api/error_codes.md)

