---
title: 课程信息共享（课程空间）
slug: course-space
sidebar_label: 课程信息共享
description: 教学班维度的课程信息共享与可信协作
sidebar_position: 19
---

代码：`internal/domains/course_space`（OpenAPI Tag `CourseSpace`）。路径前缀 `/api/v1/course-spaces/*`、`/api/v1/course-items/*`、`/api/v1/course-revisions/*`、`/api/v1/course-events/*` 与用户/管理侧 `/api/v1/user/course-*`、`/api/v1/admin/course-*`。**字段与完整路径以 OpenAPI 为准**。

课程空间以「教学班」为粒度，让同一教学班的学生共享课程信息（通知、作业、笔记、资料等），并用「角色背书 + 学生共识」的信任模型保证共享信息可信。

## 核心概念

| 概念 | 说明 |
|------|------|
| 空间（Space） | 一个教学班，唯一键 = 学校 + 学年 + 学期 + 教学班 key；含 `status`（active / archived）与 `rollout_enabled` 渐进放量开关 |
| 成员（Member） | 空间成员；`joined` / `verified`（身份核验 + 有效期）状态，支持受限（restricted）与吊销（revoked） |
| 角色（ta / representative） | 助教 / 课代表；通过 `RoleApplication` 申请（附证据），审核后授予 `RoleGrant`（带起止时间） |
| 条目与版本（Item / Revision） | 共享信息条目与修订版本；含可见性（public / members / private）、背书（endorsement）与争议状态 |
| 信任模型 | 学生投票确认/纠错（Vote）+ TA / Admin 背书（Attestation）；共识阈值见下 |
| 举报（Report） | 对条目纠错举报（附证据），审核决议，支持举报人与作者两路申诉 |
| 事件（Event / Session） | 作业、考试、通知等课程事件与上课场次；可绑定个人日历与课表 |
| 负责人（Head） | 空间负责人管理（`/api/v1/course-heads`） |

## 信任模型（行为级）

条目版本的可信度由两层信号共同决定，公开文档只描述行为，不固定权重：

- **角色背书**：TA 或管理员背书（`ta_verified` / `admin_verified`）直接视为可信。
- **学生共识**：足够数量的学生投票「确认」、总样本达标且确认比例超过阈值时，形成 `student_consensus`；纠错数达到阈值则进入 `flagged` / `under_review` 争议态。
- 默认共识参数：`MinConfirm=3`、`MinTotal=3`、`ConfirmRatio=0.8`、`DisputeThreshold=3`（`DefaultTrustPolicy`）。

仅「已核验」成员可投票，且不能给本人条目投票。历史核验成员在空间归档后仍可只读访问（`HistoricalVerified`）。

## 能力分组

- **成员与角色**：加入 / 成员状态、角色申请与取消；申请证据为私有附件，仅申请人本人与授权审核人可见。
- **条目与可信协作**：条目 / 版本 / 修订的读写与撤回、投票确认 / 纠错、背书、举报与两路申诉、论坛关联。
- **日程与日历**：课程事件与会话、个人日历绑定、课表关联、事件变更通知偏好。
- **邀请分享**：课后邀请符合条件成员分享资料，经 `InviteJob` 分批扫描与推送配额（`InvitePushReservation`）控制。
- **管理端**：空间 / 成员 / 角色申请 / 授权 / 举报 / 审计 / 负责人 / 主课表导入（master-sessions import）与投影失败重试（projection-failures）。

**完整端点见 [课程信息共享接口参考](../api/course-space.md)**（管理端见 [管理后台接口参考](../api/admin.md)）。

## 边界与云控

- **渐进放量**：空间 `rollout_enabled` 与功能开关（自动投影、推送、写入）由云控 flag 控制（`subapp.courseSharing`、`courseSharing.*`），见 [云控](./cloudcontrol.md)。
- **证据隐私**：申请/举报证据不通过课程信息或论坛附件路由暴露。
- **可观测性**：写路径有事件 outbox、幂等键与审计日志（`course_outbox`、`course_idempotency_keys`、`course_audit_logs`）。

## 相关

- [模块详解](./index.md)
- [课程服务概览](./course/index.md)
- [云控](./cloudcontrol.md)
- [站内通知](./notification.md)
