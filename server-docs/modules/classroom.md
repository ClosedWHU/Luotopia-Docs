---
title: 空闲教室查询
sidebar_label: 空闲教室
sidebar_position: 9
---

代码：`internal/domains/campus/classroom`。提供武汉大学各校区（文理学部、信息学部、工学部、医学部）按时间段的空闲教室检索。

## 教室可用性查询

支持多维度的空闲状态检索：

- **Campus**：按校区过滤。
- **Building**：按具体教学楼过滤（如教五、一教）。
- **Time**：按星期、节次（1-13 节）及周次进行精确匹配。

## 教室信息管理

记录教室的基础设施信息：

- **Capacity**：教室容量。
- **Type**：教室类型（多媒体教室、机房、普通教室）。

## 数据来源

数据通过管理员或定时任务批量导入（数据源以实现为准）。

## 接口说明

- `GET /api/v1/classrooms/empty`：查询指定时间点的空闲教室列表（参数以 OpenAPI 为准）。

## 相关

- [模块详解](./index.md)
- [校园边界](./campus_proxies.md)
- [API 接口参考（摘要）](../api/full_reference.md)
