---
title: 论坛声望（Karma）与等级
sidebar_label: 声望与等级
sidebar_position: 7
---

代码：`internal/domains/forum`（`model/karma.go`、`model/leaderboard.go`）。路径前缀 `/api/v1/forum/*`，需登录。**字段与完整路径以 OpenAPI 为准**；具体数值以实现为准，但下述默认参数为代码内置。

论坛用「声望（karma）」衡量用户贡献，声望决定等级，等级决定每日免费点赞/点踩配额。UI 文案以本地化为准（内部注释标注为「业力」）。

## 声望来源（行为级）

| 来源 | 默认值 | 说明 |
|------|--------|------|
| 收到点赞 / 点踩 | +2 / -2（帖子）、+1 / -1（评论） | 内容获赞加分、被踩减分 |
| 发帖 / 发评论 | +3 / +1 | 每日有上限（发帖 15、评论 20，Asia/Shanghai 日） |
| 每日签到 | 固定 10 或随机（均值 8、区间 1–20） | 每日一次；连续签到有 streak 加成 |
| 点赞 / 点踩成本 | -1 / -2 | 投票消耗自身声望 |
| 主课表贡献 / 食堂贡献 | +… | 由对应域结算（`master_timetable_contribution` / `dining_contribution`） |
| 管理员调整 / 审核回滚 | 自定义 | 需审计理由（`admin_adjust`、`moderation_rollback`） |

> [!NOTE]
> 水区（`BoardIDWater = "water"`）的离题 / 低信号帖子不发放发帖奖励。

## 等级与配额

- 等级阈值：`LevelThresholds`（0, 20, 60, 150, 350, 700, 1200, 2000, 3200, 5000, 8000）。
- 每日免费配额按等级递增：点赞 `DailyFreeUp`、点踩 `DailyFreeDown`（如 Lv0 为 3/1，逐级提高）。
- 降级采用软降级：跌破阈值后保留原等级 7 天（`SoftDemotionDays`），期间若回升则不降。

## 端点

声望快照 / 流水 / 签到 / 隐私开关 / 排行榜与管理调整的完整端点见[论坛接口参考](../../api/forum.md)（需登录，管理调整走 `forum:manage-users`）。

## 边界

- 点赞/点踩消耗自身声望；对同一内容反应互斥，撤销会退款（`vote_cost_refund`）。
- 相互点赞会被衰减（`MutualUpvoteWindowHours=24`、`MutualUpvoteThreshold=2`）。
- 声望流水（`forum_karma_ledger`）不可变，管理员调整需理由，用于审计。

## 相关

- [论坛模块](./index.md)
- [互动系统](./interaction.md)
- [治理与规则](./governance.md)
- [食堂服务](../dining.md)（贡献结算）
