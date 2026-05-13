# 论坛内容安全

内容安全模块通过“人工举报 + AI 预审 + 管理员裁决”的三位一体机制维护社区环境。

## 1. 举报系统
### 1.1 举报流 (`createReportRecord`)
- **来源**: 支持用户举报 (`user_report`) 和系统自动标记 (`ai_flag`)。
- **追溯性**: 每个举报案（Report Case）都会生成一个唯一的 `TraceID`，用于追踪从举报到裁决的全过程。
- **哈希链**: 举报与后续动作通过 `PrevEventHash` 形成不可篡改的事件链，存储在 `moderation_actions` 表中。

## 2. 自动化 AI 审核
系统集成了启发式 AI 审核提供者 (`AIModerationProvider`)。

### 2.1 审核逻辑 (`HeuristicAIModerationProvider`)
- **关键词加权**: 对敏感词（如“诈骗”、“辱骂”等）设置不同权重。
- **风险判定**: 
    - `Score >= 0.8`: 高风险 (`ai-high-risk`)，帖子自动设为 `PendingReview` 且可能触发自动隐藏。
    - `Score > 0.35`: 不确定 (`ai-uncertain`)，标记待审。

## 3. 管理员裁决
### 3.1 处理动作 (`ResolveReport`)
管理员可执行以下操作：
- **Approve**: 判定内容合规，恢复可见性。
- **Reject**: 驳回恶意举报。
- **Hide/Delete**: 隐藏内容，并可选择是否对作者执行“联合惩罚”（如冻结邀请额度）。

### 3.2 申诉机制
- 用户对裁决不满时可发起申诉 (`CreateAppeal`)。
- 申诉需由另一名管理员（或原管理员复核）处理。

## 4. 数据库设计要点
- 使用 `jsonb` 存储审核详情，以便灵活扩展 AI 返回的结构化数据。
- 敏感词库支持通过管理员 API 动态更新。
