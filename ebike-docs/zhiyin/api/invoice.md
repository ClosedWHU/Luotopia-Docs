---
title: 发票接口
sidebar_label: 发票
description: 开票申请、开票记录、可开票金额与卡券账单等 7 个接口的完整清单与调用方标注。
sidebar_position: 10
---

## 发票（7）

调用方（模块 `06c7`）：`pagesSub/selectInvoiceType/selectInvoiceType.js`（开票类型选择入口）、`pagesSub/issueInvoice/issueInvoice.js`（createInvoice/getInvoiceAmount/getInvoicedOrders）、`pagesSub/invoiceHistory/invoiceHistory.js`（getInvoiceList）、`pagesSub/invoiceDetail/invoiceDetail.js`、`pagesSub/ridingCardInvoice/ridingCardInvoice.js`（getRidingCardInvoiceList）、`pagesSub/vipCardInvoice/vipCardInvoice.js`（getDepositCard for_bill/优惠卡账单）。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/invoice/create` | POST | createInvoice | 申请开票 | 06c7 |
| `/client/invoice/page` | POST | getInvoiceList | 开票记录分页 | 06c7 |
| `/client/invoice/setting/get` | POST | getInvoiceSetting | 开票设置(抬头) | 06c7 |
| `/client/order/invoiceAmount` | POST | getInvoiceAmount | 可开票金额 | 06c7 |
| `/client/order/v2/listInvoicedOrders` | POST | getInvoicedOrders | 已开票订单列表 | 06c7 |
| `/ebike_account/deposit_card/client/get_deposit_card/for_bill` | POST | getDepositCard | 押金卡开票账单 | 06c7 |
| `/ebike_account/riding_card/client/get_riding_card/for_bill` | POST | getRidingCardInvoiceList | 骑行卡开票列表 | 06c7 |
