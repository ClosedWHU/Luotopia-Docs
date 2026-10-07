---
title: 空闲教室查询
sidebar_label: 空闲教室
sidebar_position: 9
---

代码：`internal/domains/campus/classroom`。按时间段检索武汉大学各校区（文理学部、信息学部、工学部、医学部）的空闲教室。

## 查询条件

- `Campus`：按校区过滤。
- `Building`：按具体教学楼过滤（如教五、一教）。
- `Time`：按星期、节次（1-13 节）与周次精确匹配。

教室记录还保存基础设施信息：`Capacity` 为教室容量，`Type` 为教室类型（多媒体教室、机房、普通教室）。

## 数据来源与接口

管理员或定时任务批量导入教室数据，数据源以实现为准。

- `GET /api/v1/classrooms/empty`：查询指定时间点的空闲教室列表（参数以 OpenAPI 为准）。
- 完整端点见[校园接口参考](../api/campus.md)。

## 相关

- [模块详解](./index.md)
- [校园边界](./campus_proxies.md)
- [校园接口参考](../api/campus.md)
