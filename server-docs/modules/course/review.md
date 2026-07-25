---
title: 课程评价
sidebar_label: 课程评价
sidebar_position: 1
---

# 课程评价

代码：`internal/domains/course_review`（`http` / `service` / `repo`）。

## 1. 行为要点

- **登录可写**；读/写 Access 以 OpenAPI 与 `httpapi` 注册为准（多数课评读为公开或按操作声明，写接口需登录）。  
- 评价与课程 / 教师关联；提交需 **修读资格**（见 [course-review-and-identity-policy](../forum/course-review-and-identity-policy.md)、`POST /api/v1/user/transcript/sync`）。  
- 对外展示匿名；后端可保留作者 ID 用于反作弊与本人编辑删除。  
- 审核 / 通过后的状态才进入统计（以 `is_approved` 等字段与服务逻辑为准）。

## 2. 相关 API（摘要）

| 能力 | 说明 |
|------|------|
| 提交评价 | `POST` 评价相关路径（OpenAPI） |
| 列表 / 详情 | 按课程 UID 等查询 |
| 管理审核 | `/api/v1/admin/...` |

## 3. 与给分

给分样本与聚合见 [course_grades](./course_grades.md)。评价与给分资格都依赖客户端上传的修读结果，**不**用教务 Cookie。

## 4. 内容安全

敏感词 / 审核走平台与论坛侧能力；具体包名以实现为准（勿依赖已删除的路径）。

---
[返回](./index.md)
