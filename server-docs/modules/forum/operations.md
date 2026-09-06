---
title: 论坛运营
sidebar_label: 运营工具
sidebar_position: 5
---


代码：`internal/domains/forum`（运营/通知相关 repo）。  
站内通知列表也可能走 `components/notification`；**以 OpenAPI 为准**。邀请制是否启用取决于产品与配置，勿假设永远强制邀请注册。

## 1. 通知系统
系统实现了站内信通知机制。
- **种类 (`NotificationKind`)**: 包含 `reply`（回复）、`reaction`（点赞）、`moderation`（审核通知）、`appeal`（申诉结果）。
- **聚合逻辑**: 为了防止骚扰，系统会对同类型的点赞进行一定程度的聚合。
- **发送逻辑**: 调用 `createNotificationTx`。建议在事务末尾执行，以防业务回滚导致产生“幽灵通知”。

## 2. 邀请系统

若产品开启邀请相关能力（以实现 / `forum_settings` 为准）：

- 配额、扣减、冻结等字段与逻辑在 forum 配置与 repo 中  
- **勿假设**全站永远只能邀请注册；identity 侧仍有常规注册路径

## 3. 校友验证
- **Email 后缀校验**: 核心逻辑在于 `Settings.AllowedEmailSuffixes`（默认为 `whu.edu.cn`）。
- **验证流程**: 
    1. 用户提交 Email。
    2. 系统通过 Worker 发送验证码。
    3. 校验通过后，用户账户状态转为 `Active`。

## 4. 全局设置
- 论坛的所有行为参数（如发帖间隔、自动隐藏阈值等）都存储在 `forum_settings` 表中。
- 提供 `GetSettings` 缓存方法，减少高频访问下的数据库压力。
