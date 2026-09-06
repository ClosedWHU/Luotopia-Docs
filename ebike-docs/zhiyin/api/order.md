---
title: 订单 / 计费接口
sidebar_label: 订单/计费
description: 订单列表、订单详情、骑行轨迹、费用预计算与工单申诉等 11 个接口的完整清单与调用方标注。
sidebar_position: 7
---

## 订单 / 计费（11）

调用方：`pagesSub/order/order.js`（getOrderList + getReserveOrderList 双 tab 分页）、`pagesSub/order/deductOrder.js`（getOrderList 代扣单）、`pagesSub/order/reserveItem.js`（预约单项）、`pagesSub/costDetail/costDetail.js`（getOrderDetail、rideCardFreeCost）、`pagesSub/tripMap/tripMap.js`（getOrderDetail + orderGetTrajectory 轨迹回放）、`pagesSub/objection/objection.js`（createUserTicket 费用异议/申诉）、`pagesSub/accountRules/accountRules.js`（计费规则说明，模块 `e76f`）；支付侧 `pagesSub2/pay/pay.js`（getOrderDetail、preCalculateCost、checkFrozen/setFrozonOrder）、`pagesSub2/pay/payScoreOrder.js` 与 `wechatPayScoreOrder.js`（模块 `f8b7` + 3s 轮询）、`pagesSub2/pay/reservePay.js`（预约单支付/退款）、`pagesSub2/resultDisplay/payResultPoller.js`（**支付结果轮询页**：`getOrderDetail`(byId)/`getLastDetail`(byLast，无 orderId 时按 `userPin` 查最近单) 每 **2s** 轮询、上限 **15 次**（约 30s）后弹「支付状态更新异常，请勿重复支付!」）、`pagesSub2/userInfo/userInfo.js`。行程中轮询 getRideInfo 见[车辆控制流程](../flows/unlock-return.md)。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/order/config/billingRule` | POST | getMultipleRuleConfig | 多计费规则配置 | e76f |
| `/client/order/config/get` | POST | getRuleConfig | 计费规则配置 | e76f |
| `/client/order/detail` | POST | getOrderDetail | 订单详情 | f8b7 |
| `/client/order/getTrajectory` | POST | orderGetTrajectory | 订单骑行轨迹 | f8b7 |
| `/client/order/list` | POST | getOrderList | 订单列表 | f8b7 |
| `/client/order/preCalculateCost` | POST | preCalculateCost | 行程费用预计算 | f8b7 |
| `/client/order/rideCardFreeCost` | POST | rideCardFreeCost | 骑行卡免费时长抵扣计算 | f8b7 |
| `/client/preBook/page` | POST | getReserveOrderList | 预约订单分页 | f8b7 |
| `/client/preBook/refund` | POST | reserveOrderRefund | 预约订单退款 | f8b7 |
| `/client/userTicket/createUserTicket` | POST | createUserTicket | 创建工单(申诉/调度费) | f8b7 |
| `/client/userTicket/validateMiniProgramTicketApply` | POST | validateMiniProgramTicketApply | 工单申请校验 | f8b7 |
