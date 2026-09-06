---
title: 支付 / 充值 / 钱包 / 微信支付分接口
sidebar_label: 支付/钱包
description: 支付单创建、充值、钱包、押金、退款与微信支付分共 48 个接口的完整清单与调用方标注。
sidebar_position: 8
---

## 支付 / 充值 / 钱包（38）＋ 微信支付分（10）

调用方：模块 `90b5` payMoney mixin（createPay/queryPayOrder/payCancel；校园卡 campusCardPwd）、`components/chargeCommon`（getRechargeList）、`components/cardDetailModal`、`components/depositCardList`（payMoney 购买卡券/押金卡）、模块 `7c9e`（支付分确认流程）。页面级调用方：充值页 `pagesSub/charge/charge.js`（`sale_type:"WALLET"` + `sale_info:{total_fee, active_id, iz_b…}`；先 `getConfigRechargeBeforeUse`/`getRechargeConfig({service_id})`；校园卡分支 `payMoney("CAMPUS_CARD", …)` 弹 `payPwd` 密码框→`onGetPassword`/`onSubmit`）、`pagesSub/chargeList/chargeList.js`（购买/消费/退款记录：userRecord、consumption、favorableCard、refundDetails）、`pagesSub/wallet/wallet.js`（userAccount 资产汇总、getRidinCardDetail/getFavorableCardDetail 卡详情、getPermissionConfig/getScorePermissionRecord 支付分授权状态）、`pagesSub/refundableBalance/refundableBalance.js`（getWalletInfo、applyRefund、refundStatus）、`pagesSub/retunDeposit/retunDeposit.js`（押金 deposit/refundDeposit）、`pagesSub/depositCardStore/depositCardStore.js`（押金卡购买）、`pagesSub/obtainQualification/obtainQualification.js`（用车资格/免押，模块 `3e0f`）；支付页族 `pagesSub2/pay/*`（含代付 createProxyPay、云闪付/免密分支，见[支付流程](../flows/payment.md)）、`pagesSub2/pay/components/refundIntegrityModal.js`（退款诚信弹窗，模块 `3e0f`）。支付分组模块引用：`pagesSub2/pay/pay.js` 同时引入 `3e0f`/`f8b7`/`c24f`/`7661`/`7381`/`ed4c`/`b22f`/`8606`(支付分)/`d45d`(抽奖)/`90b5`。

### 支付 / 充值 / 钱包（38）

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/izShowRefundDialog` | POST | izShowRefundDialog | 是否展示退款引导弹窗 | 3e0f |
| `/client/order/detailLast` | POST | getLastDetail | 最近一笔订单详情 | 3e0f |
| `/client/order/frozen` | POST | setFrozonOrder | 订单冻结 | 3e0f |
| `/client/order/queryFrozen` | POST | checkFrozen | 查询冻结订单 | 3e0f |
| `/client/order/toPayPageRecharge` | POST | toPayPageRecharge | 支付页引导充值 | 3e0f |
| `/client/rent/buyingOrder` | POST | buyingOrder | 订单标记购买骑行卡 | 3e0f |
| `/client/rent/closeOrder` | POST | closeOrder | 关闭订单 | 3e0f |
| `/client/rent/frozenOrderToPay` | POST | frozenOrderToPay | 冻结订单转支付 | 3e0f |
| `/client/rent/paySuc` | POST | reportPaySuc | 支付成功上报 | 3e0f |
| `/client/rent/return/deductWallet` | POST | deductWallet | 还车费用钱包抵扣 | 3e0f |
| `/client/signCloseRefundDialog` | POST | signCloseRefundDialog | 关闭退款弹窗标记 | 3e0f |
| `/client/systemConfig/getConfigPay` | POST | getConfigPay | 获取支付配置（serviceId 维度） | 3e0f |
| `/client/systemConfig/getConfigUseCarStudy` | POST | getConfigUseCarStudy | 用车学习配置 | 3e0f |
| `/client/userTicket/exemptDispatchFee` | POST | exemptDispatchFee | 免除调度费 | 3e0f |
| `/ebike_account/user_refund_recharge/client/log` | POST | refundDetails | 退款记录 | 3e0f |
| `/ebike_account/user_refund_recharge/client/order_pay_finish_wallet_refund_config/query` | POST | getWalletRefundConfig | 支付完成页钱包退款配置 | 3e0f |
| `/ebike_account/user_refund_recharge/client/refund_statue` | POST | refundStatus | 退款状态查询 | 3e0f |
| `/ebike_account/user_refund_recharge/client/start` | POST | applyRefund | 发起余额退款 | 3e0f |
| `/ebike_account/wallet/client/get_wallet_info` | POST | getWalletInfo | 钱包信息(余额/押金) | 3e0f |
| `/ebike_marketing/activity/client/app/get_recharge_config` | POST | getRechargeConfig | 充值营销配置 | 3e0f |
| `/ebike_marketing/activity/client/app/recharge_list` | POST | getRechargeList | 充值档位列表 | 3e0f |
| `/ebike_marketing/activity/client/app/recharge_scope` | POST | getRechargeScope | 充值范围 | 3e0f |
| `/ebike_marketing/activity/client/app/second_kill_buy_cancel` | POST | cancelBuy | 秒杀订单取消 | 3e0f |
| `/ebike_pay/pay/client/campus_card/bind` | POST | campusCardBind | 校园一卡通绑定 | 72b8 |
| `/ebike_pay/pay/client/campus_card/delete` | POST | campusCardDelete | 校园一卡通解绑 | 72b8 |
| `/ebike_pay/pay/client/campus_card/query` | POST | campusCardQuery | 校园一卡通查询 | 72b8 |
| `/ebike_pay/pay/client/campus_card/verify_pwd` | POST | campusCardPwd | 校园卡支付密码校验 | 72b8 |
| `/ebike_pay/pay/client/create` | POST | createPay | **创建支付单（返回 wx.requestPayment 参数）** | 3e0f |
| `/ebike_pay/pay/client/create_proxy_pay` | POST | createProxyPay | 创建代付订单 | 3e0f |
| `/ebike_pay/pay/client/pay_cancel` | POST | payCancel | 支付取消/异常上报 | 3e0f |
| `/ebike_pay/pay/client/pay_channel_edit` | POST | editUserPayChannel | 修改用户支付渠道 | 3e0f |
| `/ebike_pay/pay/client/pay_channel_get` | POST | getUserPayChannel | 获取用户支付渠道 | 3e0f |
| `/ebike_pay/pay/client/tianman/payments/query` | POST | queryPayOrder | 支付订单状态查询(云闪付/天满轮询) | 3e0f |
| `/ebike_visual/merchant/client/deposit/user_record` | POST | deposit | 押金缴纳记录 | 3e0f |
| `/ebike_visual/merchant/client/favorable_card/user_record` | POST | favorableCard | 优惠卡购买记录 | 3e0f |
| `/ebike_visual/merchant/client/riding_card/user_record` | POST | ridingCard | 骑行卡购买记录 | 3e0f |
| `/ebike_visual/merchant/client/wallet/user_buy_record` | POST | userRecord | 钱包购买(充值)记录 | 3e0f |
| `/ebike_visual/merchant/client/wallet/user_consumption_record` | POST | consumption | 钱包消费记录 | 3e0f |

### 微信支付分（10）

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/pay/score/completeOrder` | POST | completeOrder | 支付分订单完结(扣款) | 8606 |
| `/client/pay/score/confirm/noConfirmExpireTime` | POST | updateNoConfirmExpireTime | 更新未确认过期时间 | 8606 |
| `/client/pay/score/createOrder` | POST | createWechatPayScoreOrder | 创建支付分订单(免押骑行) | 8606 |
| `/client/pay/score/createOrderConfirm` | POST | createOrderConfirm | 创建支付分确认订单(押金确认，返回 openBusinessView 参数) | 8606 |
| `/client/pay/score/getPermissionRecord` | POST | getWechatPayScoreRecord | 支付分授权记录查询 | 8606 |
| `/client/pay/score/getWxScorePayScoreDepositedConfirmChannel` | POST | wechatPayScoreConfirmChannel | 支付分押金确认渠道查询 | 8606 |
| `/client/pay/score/queryByEbikeOrderId` | POST | queryWxScoreOrder | 按骑行订单查支付分单 | 8606 |
| `/client/pay/score/queryConfirmRecord` | POST | refreshScoreRecord | 支付分确认记录刷新 | 8606 |
| `/client/pay/score/updateConfirmExpireTime` | POST | updateConfirmExpireTime | 更新确认过期时间 | 8606 |
| `/client/ridingPermission/get` | POST | getPermissionConfig | 骑行权限配置(支付分) | 8606 |
