---
title: 报修 / 违章上报接口
sidebar_label: 报修/违章
description: 车辆报修、报修记录、违章暗哨上报等 7 个接口的完整清单与调用方标注。
sidebar_position: 6
---

## 报修 / 违章上报（7）

调用方（模块 `c3be`）：`pagesSub/repair/repair.js`（报修提交，含照片上传）、`pagesSub/repair/repairRecord.js`（repairList）、`pagesSub/repair/repairProgress.js`（repairDetails）、`pagesSub/violationReport/violationReport.js`（submitSneak）、`pagesSub/objection/objection.js`（费用异议关联报修）；**骑行页报修入口**：`pagesSub2/riding/riding.js` 按 `returnPermission.izCanAfterRidingRepair` 显示报修按钮并调 `getRepairConfigList({carId})`；`pagesSub2/pay/pay.js` 亦有 `isShowRepair` 入口。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/management/repairConfig/listByCar` | POST | getRepairConfigList | 按车辆报修项配置 | c3be |
| `/client/management/repairConfig/listByCarModel` | POST | getRepairConfigListByCarModel | 按车型报修项配置 | c3be |
| `/ebike_operation/repair/client/operate_repair/create_repair` | POST | submitRepairNew | 提交报修(新版) | c3be |
| `/ebike_operation/repair/client/operate_repair/repair_detail` | POST | repairDetails | 报修详情 | c3be |
| `/ebike_operation/repair/client/operate_repair/repair_list` | POST | repairList | 报修记录 | c3be |
| `/ebike_operation/tools/client/repair` | POST | submitRepair | 提交报修(旧版) | c3be |
| `/ebike_operation/tools/client/sneak` | POST | submitSneak | 违章/暗哨上报 | c3be |
