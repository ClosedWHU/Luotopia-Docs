---
title: 课程给分与统计
slug: course-grades
sidebar_label: 给分与统计
sidebar_position: 2
---

## 模块概述

本模块负责**自有给分样本库**、隐私安全的聚合统计，以及通过 **ham-gateway 只读补充** Ham 大盘分布。评价资格与给分贡献均要求校园教务完成凭据（有成绩 / 缺考 / 中期退课），不以 Cookie 或手填分作为资格。

种子评价数据可用 `go run scripts/main.go import -input scripts/courses.json ...`（见 `server/scripts/README.md`）。运行时给分样本写入自有表（如 `grade_submissions`，以模型为准）。

## 三级数据模型

| 层级 | 来源 | 存储 | 用途 |
|------|------|------|------|
| L1 | 登录用户 + 已核验教务资格 | `grade_submissions` | 单用户匿名样本（API 不回传） |
| L2 | L1 全量重算 | `grade_stats` | 课 + 师聚合；低样本时聚合被抑制（阈值为实现细节） |
| L3 | ham-gateway | 内存 / Redis 缓存 | 只读补充；失败不影响 L1/L2 |

### 展示策略（`GradeView`）

- `own.sufficient == true`（自有样本达到展示阈值）→ `primary = own`，自有均值为权威
- 否则 → 若 Ham 可用则 `primary = ham`，仍返回 `own.sample_count`
- Ham 与自有**不混算**同一均值；客户端可并排展示

### 评价 / 给分资格

- **服务端不接收教务 Cookie / 密码**
- 评价与给分资格由服务端按内部风控规则授予（基于已核验的修读记录）
- 主路径：`POST /api/v1/user/review-eligibility/sync`（需登录；服务端自行核验教务成绩后授予资格，字段以 OpenAPI 为准）
- 映射：`courses.code` 或 `course_external_mappings` → 内部课程 UID

## 分布桶

自有聚合按分数区间分桶（区间边界以 OpenAPI / 模型为准），另有绩点档（`grade_point_buckets`）匿名计数。

## 架构落点

实现位于 `internal/domains/course_review/`（http / service / client 等）。

论坛等其他域只依赖 `course_uid`；外部只读给分源（若启用）由服务端内部客户端拉取，**不对外暴露任意代理路由**，也**不**用用户教务 Cookie。

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/user/review-eligibility` | 已可评价的 `course_uids` |
| POST | `/api/v1/user/review-eligibility/sync` | 由服务端核验教务成绩后导入评价资格（可选贡献给分样本） |
| POST | `/api/v1/course/grades/resolve` | 解析 / 种子化课程与教师对 |
| POST | `/api/v1/course/grades/prepare/{course_uid}` | 为课程预置教师 |
| GET | `/api/v1/course/grades/teachers/{course_uid}` | 按教学团队分组的教师 |
| GET | `/api/v1/course/grades/view/{course_uid}` | 自有 + 可选 Ham 合并视图 |

字段与完整路径以 OpenAPI 为准。

### `GradeView` 响应要点

`GradeView` 合并自有样本与可选 Ham 补充，关键字段：

- `primary`：`own` 或 `ham`（展示权威来源）
- `own`：`sample_count`、`sufficient`、均值与分布桶（自有聚合；低样本时被抑制）
- `ham`：`available`、`course_name`、`instructor`、`sample_count`、`average`、`buckets`（只读补充）

字段名与类型以 OpenAPI 为准。

## 数据库模型

- `UserTranscriptRecord`：私有成绩行
- `CourseCompletionRecord`：评价 / 给分资格（含核验来源与信任状态）
- `GradeSubmission`：匿名样本 user + course + teacher + semester upsert
- `GradeStats`：课 + 师聚合缓存
- `CourseExternalMapping`：课号映射

## 导入

评价主数据：

```bash
go run main.go import -input courses.json -direct
# 或生成 SQL：
go run scripts/main.go import -input scripts/courses.json -output scripts/data.generated.sql
```

不使用 `/tmp/search-course*` 的 CSV 作为主库。

## 运营：未映射课号

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/admin/course-external-mappings/unmapped` | 未映射课号队列（次数、样例课名 / 教师） |
| PUT | `/api/v1/admin/course-external-mappings` | 写入 `campus` 映射，并触发成绩行重映射（remap job） |
| GET | `/api/v1/admin/course-external-mappings/remap-jobs/{job_id}` | 重映射任务状态 |
| GET | `/api/v1/admin/course-external-mappings` | 已有映射列表 |
| DELETE | `/api/v1/admin/course-external-mappings/{external_course_id}` | 删除映射 |

## 相关

- [课评身份与资格策略](../forum/course_review_and_identity_policy.md)
- [课程评价](./review.md)
- [课程服务概览](./index.md)
