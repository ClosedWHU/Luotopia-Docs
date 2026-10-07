---
title: 论坛运营工具
sidebar_label: 运营工具
sidebar_position: 5
---

代码：`internal/domains/forum`（运营 / 通知相关 repo）。
站内通知列表走 `internal/domains/notification`，以 OpenAPI 为准。邀请制是否启用取决于产品与配置，勿假设永远强制邀请注册。

## 通知系统

站内信通知的种类（`NotificationKind`）：`like`（点赞）、`favorite`（收藏）、`reply`（回复）、`alumni`（校友验证结果）、`appeal`（申诉结果）、`moderation`（审核）、`admin`（管理通知）、`system`（系统）。

- 聚合逻辑：为防止骚扰，服务端按类型聚合点赞通知，具体条数与时间窗由实现决定。
- 发送逻辑：通知创建建议在事务末尾执行，以防业务回滚产生「幽灵通知」。

## 邀请系统

若产品开启邀请相关能力（以实现 / `forum_settings` 为准）：

- 配额、扣减、冻结等字段与逻辑在 forum 配置与 repo 中
- **勿假设**全站永远只能邀请注册；identity 侧仍有常规注册路径

## 校友验证

- Email 后缀校验：由 `Settings.AllowedEmailSuffixes` 控制，默认 `whu.edu.cn`。
- 验证流程：

    1. 用户提交真实姓名、毕业年份、院系与凭证（`AlumniVerificationSubmitInput`）。
    2. 记录以 `pending` 创建，等待管理员人工审核。
    3. 管理员经 `POST /api/v1/forum/admin/alumni/verifications/{id}/review` 批准或驳回；通过后账户转为 `Active`。

> [!NOTE]
> 旧「提交 Email → Worker 发验证码 → 自动转 Active」的流程已改为人工审核，见上。

## 全局设置

- 论坛的行为参数（如发帖间隔、自动处置阈值等）集中存储在 `forum_settings` 表中；具体数值为实现细节。
- 设置读取方法带缓存，以降低高频访问下的数据库压力。

## 相关

- [论坛模块](./index.md)
- [治理与规则](./governance.md)
- [站内通知](../notification.md)
