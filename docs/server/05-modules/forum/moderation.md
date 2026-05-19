# 论坛内容安全

内容安全模块通过“人工举报 + AI 预审 + 管理员裁决”的三位一体机制维护社区环境。

## 1. 举报系统
### 1.1 举报流 (`createReportRecord`)
- **来源**: 支持用户举报 (`user_report`) 和系统自动标记 (`ai_flag`)。
- **追溯性**: 每个举报案（Report Case）都会生成一个唯一的 `TraceID`，用于追踪从举报到裁决的全过程。
- **哈希链**: 举报与后续动作通过 `PrevEventHash` 形成不可篡改的事件链，存储在 `moderation_actions` 表中。

## 2. 自动化 AI 审核

系统支持多种 AI 审核提供者，通过 `AIModerationProvider` 接口统一调用。

### 2.1 启发式审核 (`HeuristicAIModerationProvider`)
- **逻辑**: 基于关键词加权。
- **配置**: 对敏感词（如“诈骗”、“辱骂”等）设置不同权重。
- **风险判定**: 
    - `Score >= 0.8`: 高风险 (`ai-high-risk`)，帖子自动设为 `PendingReview`。
    - `Score > 0.35`: 不确定 (`ai-uncertain`)，标记待审。

### 2.2 智能 AI 审核 (`SmartAIModerationProvider`)
- **核心**: 基于大型语言模型 (LLM)，如 **Google Gemini**, **OpenAI GPT**, **Anthropic Claude**。
- **工作流**: 
    1. 将帖子内容发送至配置的 LLM。
    2. LLM 返回结构化的风险评分与理由。
    3. 系统根据返回的 `Confidence` 和 `Reason` 决定后续动作。
- **优势**: 能够理解上下文和语义，而非简单的关键词匹配。

### 2.3 AI 服务管理器 (AIServiceManager)
服务端集成了统一的 AI 服务管理器，支持动态切换底层 Provider：
- **Google Gemini**: 默认的高性能审核方案。
- **OpenAI**: 兼容各版本 GPT 接口。
- **Local/Self-hosted**: 支持符合 OpenAI 标准的本地部署模型。

## 3. AI 风险评估逻辑 (AI Risk Assessment Logic)
 
系统通过 `EvaluatePost` 接口获取 AI 的置信度评分（0.0 - 1.0），并根据预设阈值自动执行业务状态转换：
 
| 置信度阈值 | 内部标识 | 业务动作 |
| :--- | :--- | :--- |
| `Score >= 0.8` | `ai-high-risk` | 帖子自动隐藏 (`Visibility: Hidden`)，同步加入人工审核队列 |
| `Score > 0.35` | `ai-uncertain` | 帖子保持可见但标记为待审 (`Status: PendingReview`) |
| `Score <= 0.35` | `ai-low-risk` | 帖子正常发布，静默通过 |
 
**配置规范 (`config.json`)**:
```json
"ai_service": {
    "default_provider": "google-gemini",
    "providers": [
        {
            "name": "google-gemini",
            "protocol": "google-ai",
            "endpoint": "https://generativelanguage.googleapis.com",
            "api_key": "${GEMINI_API_KEY}",
            "models": ["gemini-pro"]
        }
    ]
}
```
 
## 4. 管理员裁决与审计
 
### 4.1 处理动作 (`ResolveReport`)
管理员可对举报记录执行以下原子操作：
- **核准 (Approve)**: 确认内容违规，执行隐藏或删除。
- **驳回 (Reject)**: 认定举报无效。
- **阶梯惩罚**: 对违规作者执行联动处罚，如冻结邀请额度、扣除社区积分或临时禁言。
 
### 4.2 数据审计与持久化
- **审计轨迹**: 所有裁决行为均持久化于 `moderation_actions` 表，包含操作人 ID、理由及原始快照。
- **JSONB 存储**: 利用 PostgreSQL 的 `jsonb` 特性存储 AI 返回的详细元数据，支持多维度分析审核模型准确率。

## 5. 常见问题 (FAQ)

**Q: 为什么 AI 误报率突然升高？**
A: 请检查 `SmartAIModerationProvider` 的提示词（Prompt）配置。在敏感时期或特定校园事件背景下，可能需要通过管理后台动态调整 `ai-high-risk` 的判定阈值。

**Q: 被隐藏的帖子可以申诉吗？**
A: 可以。用户可通过 `/api/v1/forum/appeals` 发起申诉，系统会指派非原审管理员进行复核，确保流程的公正性。

---
[返回目录](../index.md)
