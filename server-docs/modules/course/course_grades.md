---
title: 课程给分与统计
slug: course-grades
sidebar_label: 给分与统计
sidebar_position: 2
---


## 模块概述

本模块负责**自有给分样本库**、隐私安全的聚合统计，以及通过 **ham-gateway 只读补充** HAM 大盘分布。评价资格与给分提交均要求校园教务完成凭据（有成绩 / 缺考 / 中期退课），不以 Cookie 或手填分作为资格。

种子评价数据可用 `go run scripts/main.go import -input scripts/courses.json ...`（见 `server/scripts/README.md`）。运行时用户给分样本写入自有表（如 `grade_submissions`，以模型为准）。

## 三级数据模型

| 层级 | 来源 | 存储 | 用途 |
|------|------|------|------|
| L1 | 登录用户 + 教务资格 | `grade_submissions` | 单用户匿名样本（API 不回传） |
| L2 | L1 全量重算 | `grade_stats` | 课+师聚合；样本数 &lt; 5 时打码 |
| L3 | ham-gateway | 内存/Redis 缓存 | 只读补充；失败不影响 L1/L2 |

### 展示策略（`GradeView`）

- `own.sufficient == true`（样本数 ≥ 5）→ `primary = own`，自有均值为权威
- 否则 → 若 HAM 可用则 `primary = ham`，仍返回 `own.sample_count`
- HAM 与自有**不混算**同一均值；客户端可并排展示

### 评价 / 给分资格

- **服务端不使用用户 Cookie 请求教务**
- 主路径：客户端本地拉取成绩后 `POST /api/v1/user/transcript/sync` 上传成绩行 → 私有成绩/完成记录（仅 `client_transcript` 源授评价资格；字段以 OpenAPI / model 为准）
- 映射：`courses.code` 或 `course_external_mappings` → 内部课程 UID

## 分布桶

自有聚合五个区间：

- **Fail**: &lt; 60  
- **60**: 60–70  
- **70**: 70–80  
- **80**: 80–90  
- **90**: 90–100  

## 架构落点

实现位于 `internal/domains/course_review/`（http / service / client 等）。  

论坛等其它域只依赖 `course_uid`；外部只读给分源（若启用）由服务端内部客户端拉取，**不对外暴露任意代理路由**，也**不**用用户教务 Cookie。

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/user/transcript/sync` | 上传完整成绩（授资 + 可选写入给分样本） |
| GET | `/api/v1/user/review-eligibility` | 已可评价的 `course_uids` |
| POST | `/api/v1/course/grades/submit` | 单独提交样本（需登录 + 完成凭据） |
| GET | `/api/v1/course/grades/view/{course_uid}?teacher_uid=` | 自有 + 可选 HAM 合并视图 |

### 成绩同步请求示例

```json
{
  "items": [
    {
      "course_code": "123456",
      "course_name": "高等数学",
      "instructor": "张三",
      "year": 2024,
      "semester": "1",
      "outcome": "scored",
      "total_score": 86,
      "usual_score": 90,
      "exam_score": 84,
      "credit": 4
    }
  ],
  "contribute_grades": true
}
```

### `GradeView` 响应要点

```json
{
  "course_uid": "...",
  "teacher_uid": "...",
  "primary": "own",
  "own": {
    "sample_count": 12,
    "sufficient": true,
    "average_total": 86.5,
    "dist_fail": 0,
    "dist_60": 1,
    "dist_70": 3,
    "dist_80": 5,
    "dist_90": 3
  },
  "ham": {
    "available": true,
    "course_name": "...",
    "instructor": "...",
    "sample_count": 200,
    "average": 84.1,
    "buckets": [{"from": 0, "to": 60, "total": 5}]
  }
}
```

## 数据库模型

- `UserTranscriptRecord`：客户端上传的私有成绩行  
- `CourseCompletionRecord`：评价/给分资格（`client_transcript` 等）  
- `GradeSubmission`：匿名样本 user+course+teacher+semester upsert  
- `GradeStats`：课+师聚合缓存  
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
| GET | `/api/v1/admin/course-external-mappings/unmapped` | 未映射课号队列（次数、样例课名/教师） |
| PUT | `/api/v1/admin/course-external-mappings` | 写入 `campus` 映射，并回填 pending 成绩行 + 授资 |
| GET | `/api/v1/admin/course-external-mappings` | 已有映射列表 |
| DELETE | `/api/v1/admin/course-external-mappings/{external_course_id}` | 删除映射 |

## 后续

- 前端接 `transcript/sync` + `grades/view`  
- 教师名解析增强（别名表，而非仅 `teachers.name` 精确匹配）  
