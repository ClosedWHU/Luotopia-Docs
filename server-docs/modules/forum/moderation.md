---
title: 论坛内容安全
sidebar_label: 内容安全
sidebar_position: 4
---

代码：`internal/domains/forum` 与审核相关服务。提供商、阈值、提示词为**运维配置**，公开文档不固定数值。

## 1. 举报

| 点 | 说明 |
|----|------|
| 来源 | 用户举报、系统自动标记等 |
| 追溯 | 案件有可追踪 ID，便于从举报到裁决串联 |
| 审计 | 关键动作落库（操作者、理由、快照等） |

哈希链、表名等为实现细节。

## 2. 自动审核（边界）

支持可插拔审核提供者，例如：

- **规则 / 关键词类**：快速拦截明显违规  
- **LLM 类**：语义理解（需配置 API Key，密钥仅环境变量）  
- **本地兼容接口**：自建 OpenAI 兼容端点  

**行为分层**（概念，非固定阈值）：

| 风险档位 | 典型动作 |
|----------|----------|
| 高 | 隐藏或进人工队列 |
| 中 | 可见但待审 / 降权 |
| 低 | 正常发布 |

具体分数线、provider 默认值以实现与配置为准；**勿在公开文档写可被绕过的精确阈值表**。

配置项名级示例（值用环境变量占位）：

```json
"ai_service": {
  "default_provider": "<provider-id>",
  "providers": [
    {
      "name": "<provider-id>",
      "api_key": "${AI_API_KEY}"
    }
  ]
}
```

## 3. 管理员裁决

管理端路由前缀 `/api/v1/forum/admin/*`，细分权限码（见 [安全策略](../../architecture/security_policy.md)）：

| 权限码 | 范围 |
|--------|------|
| `forum:moderate` | 举报认领 / 释放、裁决举报、审核帖子 / 评论、处理申诉 |
| `forum:config` | 板块 / 标签 / 全局配置与配置变更日志（`GET /admin/config-changes`） |
| `forum:manage-users` | 禁言 / 封禁 / 解封、调整声望（`POST /admin/users/{id}/status`、`/admin/users/{id}/karma`） |

常见裁决流：认领举报（`POST /admin/reports/{id}/claim`）→ 裁决（`resolve`）→ 视情况处置帖子 / 评论或转申诉；处置动作写入公开管理日志（见 [治理与规则](./governance.md)）。

## 4. 常见问题

**Q: 误报变多？**  
A: 检查审核 provider、提示词与策略配置；阈值调整走管理/配置，不靠客户端绕过。

**Q: 被隐藏能否申诉？**  
A: 若产品启用申诉 API，可按 OpenAPI 发起；复核流程以实现为准。

## 相关

- [内容审核服务](../services/content_moderation.md)
- [论坛总览](./index.md)
- [模块详解](../index.md)

