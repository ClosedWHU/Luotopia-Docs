# 论坛运营工具

运营工具模块负责处理非核心互动但对社区生态至关重要的功能，如通知、邀请及校友验证。

## 1. 通知系统
系统实现了站内信通知机制。
- **种类 (`NotificationKind`)**: 包含 `reply`（回复）、`reaction`（点赞）、`moderation`（审核通知）、`appeal`（申诉结果）。
- **聚合逻辑**: 为了防止骚扰，系统会对同类型的点赞进行一定程度的聚合。
- **发送逻辑**: 调用 `createNotificationTx`。建议在事务末尾执行，以防业务回滚导致产生“幽灵通知”。

## 2. 邀请系统
Luotopia 采用邀请制注册。
- **配额管理**: 每个用户初始拥有 `DefaultInviteQuota` 个名额。
- **扣减逻辑**: 成功生成一个有效的 `InviteCode` 时扣减配额。
- **惩罚性冻结**: 管理员可以在审核违规时通过 `FreezeInvites` 选项直接将其配额清零。

## 3. 校友验证
- **Email 后缀校验**: 核心逻辑在于 `Settings.AllowedEmailSuffixes`（默认为 `whu.edu.cn`）。
- **验证流程**: 
    1. 用户提交 Email。
    2. 系统通过 Worker 发送验证码。
    3. 校验通过后，用户账户状态转为 `Active`。

## 4. 全局设置
- 论坛的所有行为参数（如发帖间隔、自动隐藏阈值等）都存储在 `forum_settings` 表中。
- 提供 `GetSettings` 缓存方法，减少高频访问下的数据库压力。
