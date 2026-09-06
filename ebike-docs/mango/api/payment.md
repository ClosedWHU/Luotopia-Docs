---
title: 支付 / 充值 / 押金 / 卡券接口
sidebar_label: 支付与押金
description: 余额充值、支付结果校验、交押金、免押卡、通勤卡、骑行卡、包车卡与退款原因接口。
sidebar_position: 4
---

## 5.4 支付 / 充值 / 押金 / 卡券

| 接口路径 | 方法 | 关键参数 | 用途 | 调用处 |
|---|---|---|---|---|
| `/miniMango/v1/finance/ticket/balance` | POST | body: `amount`(分)，`channel:"miniMango"`，`openid` | **余额充值**，也用于「支付未付订单」（`amount = globalData.hasUnPayAmount`）。返回 `{charge:{timeStamp,nonceStr,package,signType,sign}, ticket:{_id}}` → 直接喂给 `wx.requestPayment` | `pages/recharge/recharge.js:141`；`pages/index/index.js:996` |
| `/miniMango/v1/finance/ticket/{id}/check` | GET | path: `id`(=`ticket._id`) | **支付结果校验**，返回 `{paid:bool}`。全仓库 14 处调用，统一模式：`requestPayment` 的 `success` 与 `fail` 分支都延时 0.5–2s 后查一次，以服务端 `paid` 为准（fail 分支查到 `paid` 也报成功），`cardProduct` 与 `promoRideCard` 还带重试计数（4 次 / 1 次） | `pages/recharge/recharge.js:160,193`；`pages/index/index.js:1015,1068`；`pages/deposit/deposit.js:456,500`；`pages/pay/pay.js:39,74`；`pages/commutingCard/commutingCard.js:87,122`；`pages/readyUnlock/readyUnlock.js:255,288`；`pages/cardProduct/cardProduct.js:277`；`utils/promoRideCard.js:151` |
| `/miniMango/v1/finance/deposit` | POST | body: `channel:"miniMango"`，`openid`，`depositAmount`(分，来自 `getWallet` 的 `regionDepositAmount`，默认 29900=299元) | **交押金** | `pages/deposit/deposit.js:414` |
| `/miniMango/v1/finance/ticket/freeDeposit` | POST | body: `channel`，`openid`，`amount`(免押卡价，来自 `freeDeposit.actualAmount`，兜底 990) | **购买免押卡**（免押金骑行资格） | `pages/deposit/deposit.js:430` |
| `/miniMango/v1/finance/ticket/freeDepositAndCommutingCard` | POST | body: `amount`，`channel`，`openid`，`regionId` | 购买「免押 + 通勤卡」组合套餐（含永久免押资格） | `pages/deposit/deposit.js:116`；`utils/promoRideCard.js:177` |
| `/miniMango/v1/finance/ticket/commutingCard` | POST | body: `amount`(=`actualAmount`)，`channel`，`openid` | 购买通勤卡（周/月/季/年卡） | `pages/deposit/deposit.js:136`；`utils/promoRideCard.js:177` |
| `/miniMango/v1/finance/ticket/commutingCard/seasonCard` | POST | body: `channel`，`openid`，`amount` | 购买季卡。key 名 `bugCommutingCard` 疑为 `buyCommutingCard` 拼写错误 | `pages/commutingCard/commutingCard.js:62`；`pages/pay/pay.js:15` |
| `/miniMango/v1/finance/ticket/cardProduct` | POST | body: `itemId`，`amount`，`channel`，`openid` | 购买新版骑行卡商品 | `pages/cardProduct/cardProduct.js:241`；`utils/promoRideCard.js:177` |
| `/miniMango/v1/finance/ticket/charteredEbikeCard` | POST | body: `region`(=`stock.region`)，`channel`，`openid`，`amount`(=`charterList[charterWay-1].amount`) | **购买包车卡**，在 `getStock` 后、`createOrder` 前触发；支付成功 → `globalData.hasCharterCard=true` → `unlockBike()` | `pages/readyUnlock/readyUnlock.js:235` |
| `/miniMango/v1/finance/ticket/wxPay` | — | — | 微信支付下单（key `wxPay`）—— **仅定义，未调用** | `utils/util.js` |
| `https://api.mch.weixin.qq.com/pay/unifiedorder` | — | — | 微信统一下单（key `payfor`）—— **仅定义，未调用**；小程序不可能直连商户 API（需商户证书），确认为残留 | `utils/util.js` |
| `/miniMango/v1/setting/refundReason` | GET | 无 | 退押金原因列表 `[{_id,reason}]`（覆盖前端硬编码的 8 条默认原因） | `pages/refund/refund.js:72` |
