---
title: AI 助手（Agent）
sidebar_label: AI 助手
description: 服务端 AI Agent 与工具
sidebar_position: 21
---

代码：`internal/domains/agent`（`http`、`llm`、`model`、`prompt`、`service`、`tools`）。**字段与完整路径以 OpenAPI 为准**。

服务端 AI 助手域运行带工具调用的 LLM 循环（区别于 App 内用户自配模型的客户端 AI，见 [用户指南 · AI](pathname:///user/ai)）。公开文档只描述接口与工具边界，不展开提示词 / 模型实现细节。

## 接口

`POST /api/v1/agent/chat`（对话，登录 + 操作级限流）与 `GET /api/v1/agent/tools`（工具目录）。完整端点见 [AI 助手接口参考](../api/agent.md)。

LLM 循环：最多 N 轮工具调用（实现以内置参数为准，如 5 轮 / 1200 tokens），`llm/` 为 Provider 抽象（含 OpenAI 客户端），`prompt/` 为系统提示词。

## 工具（按风险分级）

| 风险级 | 工具 |
|--------|------|
| read | 查课程 / 教师 / 搜索 / 搜论坛帖子 / 搜资料 / 查空闲教室 |
| user_read | 导出 / 列出我的日历与事项、通知、个人资料、我的评价、我的课表 |
| write | 创建 / 更新评价、发帖、发评论、标记通知已读 |

工具执行受风险分级约束，写入 / 资金类操作按产品策略确认。

## 相关

- [模块详解](./index.md)
- [内部服务](./services/index.md)
- [内容审核](./services/content_moderation.md)
