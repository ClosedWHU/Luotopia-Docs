---
title: URL 表全量 key（附录 A）
sidebar_label: URL 表全量
description: utils/util.js URL 表 100 个 key 的源码顺序全量清单与函数型 key 说明。
sidebar_position: 8
---

## 附录 A：`utils/util.js` URL 表全量 key（100 个，按源码顺序）

```text
serachForPath, getOpenId, getPhoneNumber, phoneCreateToken, sendCode, phoneWXCreateToken, auth,
couponInfo, getWallet, getUserInfo, getShare, getStock, getStockInfo, stockCanUseCheck, createOrder,
getRegion, nearStock, stockInfo, nearPark, plakingLotPlanning, plakingLotNavigation,
setDiscountParkingLotId, getCurrentOrder, finishGetCurrentorder, completeOrder, temporaryLock,
outsideRescue, unlock, payfor*, recharge, feedBack, checkRecharge, deposit, notInParkReason,
badOrderReason, takePhotoFinishOrder, dispatchWorkOrder, wxqrcode, licenseAllow, access_token*,
getQRCode, checkOperationCity, errorInfo, getUseRule, isFreeDeposit, freeDeposit, depositRefund,
depositRefundApply, checkWHUTourDepositState, cancelDepositRefund, findRefundReason, wxPay,
charterCardPay, getInstructions, getCommentTags, commitComment, bugCommutingCard, illegalParkValid,
freeDepositAndCommutingCard, getHomeShopping, collectingShopping, payForfreeDepositAndCommuting,
journeyList, journeyDetail, boxDetail, boxCmd, getWxkfId, wxkfUsedIncre, accountDestroy,
getStockWithWarn, postStockHelpJob, reservationSubmit, creditByOrderId, credits,
regionCommutingCard, payForCommutingCard, cardProducts, payForCardProduct, couponExchangeAPI,
systemMonitorReport, cancelMustNeedHelmet, stockProblemFeedBack, createWorkOrder, workOrderList,
workOrderDetail, commentWorkOrder, reportedAbuse, addressList, addressDetail, addressDefault,
mallGoodsList, mallGoodsDetail, mallOrder, mallOrderDetail, mallOrderPay, mallOrderCancel,
mallOrderRefund, mallOrderConfirm, mallGift, mallGiftRedeem
```
`*` = 非 `api.mangoebike.com`（`payfor` → `api.mch.weixin.qq.com`，`access_token` → `api.weixin.qq.com`），两者均未调用。

带路径参数的函数型 key（16 个）：`checkRecharge`、`notInParkReason`、`badOrderReason`、`journeyDetail`、`boxDetail`、`boxCmd`、`workOrderDetail`、`commentWorkOrder`、`addressDetail`、`addressDefault`、`mallGoodsDetail`、`mallOrderDetail`、`mallOrderPay`、`mallOrderCancel`、`mallOrderRefund`、`mallOrderConfirm`，统一形如：

```js
checkRecharge: function (e) { var n = e.id; return r + "/miniMango/v1/finance/ticket/" + n + "/check" }
```
