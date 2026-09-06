---
title: 商城 / 赠品接口
sidebar_label: 商城与赠品
description: 商城商品、订单、赠品资格与领取接口（部分调用点位于缺失的 shopping 分包）。
sidebar_position: 5
---

## 5.5 商城 / 赠品

| 接口路径 | 方法 | 关键参数 | 用途 | 调用处 |
|---|---|---|---|---|
| `/miniMango/v1/mall/goods` | GET | 无 | 商品列表 `[{_id,name,slogan,model,image,price,discountPrice,freeShipping,shippingFee}]`（押金页/骑行卡页的「赠品横幅」与商品橱窗） | `pages/deposit/deposit.js:191`；`pages/cardProduct/cardProduct.js:304` |
| `/miniMango/v1/mall/goods/{id}` | GET | path: `id` | 商品详情 —— 调用在 shopping 分包（源码缺失） | `utils/util.js` key `mallGoodsDetail` |
| `/miniMango/v1/mall/order` | POST/GET | — | 创建/列出商城订单 —— 同上 | `utils/util.js` key `mallOrder` |
| `/miniMango/v1/mall/order/{id}` | GET | path: `id` | 订单详情 —— 同上 | `utils/util.js` key `mallOrderDetail` |
| `/miniMango/v1/mall/order/{id}/pay` | POST | path: `id` | 订单支付 —— 同上 | `utils/util.js` key `mallOrderPay` |
| `/miniMango/v1/mall/order/{id}/cancel` | — | path: `id` | 取消订单 —— 同上 | `utils/util.js` key `mallOrderCancel` |
| `/miniMango/v1/mall/order/{id}/refund` | — | path: `id` | 申请退款 —— 同上 | `utils/util.js` key `mallOrderRefund` |
| `/miniMango/v1/mall/order/{id}/confirm` | — | path: `id` | 确认收货 —— 同上 | `utils/util.js` key `mallOrderConfirm` |
| `/miniMango/v1/mall/gift` | GET | 无 | 赠品资格/领取状态：`{gift:{...}}` 表示待领取，`{claimed:{mallOrder:<orderId>}}` 表示已领取。前端带 4 次 ×1.5s 轮询重试 | `pages/deposit/deposit.js:227`；`pages/cardProduct/cardProduct.js:339` |
| `/miniMango/v1/mall/gift/redeem` | POST | body: `addressId` | 领取赠品（生成 mallOrder），返回 `{_id}` → 跳商城订单详情 | `pages/deposit/deposit.js:309`；`pages/cardProduct/cardProduct.js:418` |
