---
title: 支付流程
sidebar_label: 支付流程
description: payMoney mixin 的微信 JSAPI 支付、特殊通道、代付/免押/钱包与行程计费相关接口全链路。
sidebar_position: 1
---

核心为 payMoney mixin（`common/vendor.js` 模块 `90b5`，被 `components/cardDetailModal`、`components/depositCardList` 及分包支付页混入）：

## 6.1 微信支付（JSAPI，知音通道 = BAOFU_WXLITE 宝付）

1. **前置**：校验 `sale_type`（如 `RECHARGE` 充值 / `DEPOSIT` 押金 / `DEPOSIT_CARD` 押金卡 / 骑行卡等）与 `sale_info.total_fee`（**分**为单位，`Math.floor`）；30 秒防重复支付（storage `eBikePayAction`，模块 `90b5` isRepeatPay/recordPayAction）；实名检查 `checkUserCertificationStatus`（未实名弹窗引导，错误码 `21010`）。
2. **openid**：`loginInfo.openid` 为空时走 `getUserOpenId()`（模块 `49c2`）→ `uniLogin()`(wx.login) → `POST /ebike_pay/pay/client/wxlite/get_access_token {code}` → `open_id`。
3. **创建支付单**：`createPay` = `POST /ebike_pay/pay/client/create`，body（BAOFU_WXLITE 分支）：
   ```json
   {
     "channel_type": "BAOFU_WXLITE",
     "channel_info": { "open_id": "<openid>", "service_id": "<serviceId>", "allow_repeat": false },
     "intercept": true,
     "sale_type": "<RECHARGE|DEPOSIT|...>",
     "sale_info": { "total_fee": 100, "...": "商品字段(goods_id 等)" },
     "pin": "<userInfo.pin>"
   }
   ```
   渠道共 21 种（WXLITE/UMS_WXLITE/UNION_WXLITE/BAOFU_WXLITE/FUBANG_WXLITE(插件 fuiou-pay)/ALILITE/BAOFU_ALILITE/ZJ_NSH_*/EASY_PAY_*/WX_FWS_DIVIDE/SWIFTPASS_WXLITE/SHOUQIANBA_WXLITE/TIANMAN_WXLITE/TIANMAN_MIANMI/ALI_MIANMI/SAOBEI_WXLITE/YEEPAY/LIANLIANPAY/CAMPUS_CARD…），channel_info 微信系传 `open_id`、支付宝系传 `buyer_id`。
4. **拉起收银台**：后端返回 `R = {timeStamp, nonceStr, package, signType, paySign, merchant_order_no, merOrderId, total_fee, …}`，客户端原样透传：
   ```js
   uni.requestPayment({ provider, timeStamp: R.timeStamp+"", nonceStr: R.nonceStr,
                        package: R.package, signType: R.signType, paySign: R.paySign, ... })
   ```
   **paySign 全部由服务端（宝付/微信商户）计算，客户端不参与支付签名**（模块 `90b5` case 157）。
5. **特殊通道**：
   - `TIANMAN_MIANMI`（云闪付免密）：`R.type===1` 时 `wx.navigateToMiniProgram({appId: R.cqpMpAppId, path: R.cqpMpPath})`（回跳识别 appId `wx3cbe919f36710d1c`）；否则每 200ms 轮询 `queryPayOrder({trade_no: R.merOrderId})`（`/ebike_pay/pay/client/tianman/payments/query`，`status 2=成功/3=失败`），上限 2s；
   - `FUBANG_WXLITE`：`requirePlugin("fuiou-pay").fuioupay({fee, mchnt_cd, message})`，失败自动降级 WXLITE；
   - `CAMPUS_CARD`：`payPasswordPopup` 输入密码 → `campusCardPwd({merchant_order_no, password})`（`/ebike_pay/pay/client/campus_card/verify_pwd`）。
6. **失败/取消**：`payCancel({pin})` 上报（`/ebike_pay/pay/client/pay_cancel`）；非微信通道失败自动兜底重试 WXLITE；错误码 `24016/24017` 触发「重复支付」确认弹窗（`allow_repeat:true` 强制重下）。
7. **成功后**（模块 `90b5` + `pagesSub2/paymentResult/paymentResult.js`）：`reportPaySuc`（`/client/rent/paySuc`）；若 storage `xa_ad_config.complementBalance` 为真且有 `sale_info.total_fee` → `navigateTo /pagesSub2/paymentResult/paymentResult?payAmount=<total_fee>`，mixin 监听 `adPageClosed` 事件后才继续正常成功流程；paymentResult 页展示金额（分→元 `/100`）与支付时间（dayjs），挂载 `x-ad` + `x-wx-smart-ad-occupy` 广告位，`onUnload` 时 `emit("adPageClosed")`。另有独立支付结果轮询页 `pagesSub2/resultDisplay/payResultPoller.js`（2s×15 次查单，见[订单/计费接口](../api/order.md)）。

## 6.2 代付 / 免押 / 钱包

- **代付（帮我付）**：`pagesSub2/pay/pay.js` 分享流程——`onShareAppMessage` 前先 `createProxyPay({order_id})`（`/ebike_pay/pay/client/create_proxy_pay`），分享卡片 path 为 `/pagesSub2/pay/pay?orderId=<order_id>&proxyPin=<当前用户pin>&serviceId=…&izPaymentOnBehalfOrder=1`（标题「短途出行，就对了！」类文案取 ext.name）。代付落地页读 `izPaymentOnBehalfOrder=1` 置 `isHelpPayPageFlag`：已登录直接取参；未登录把 query 存 storage `helpPayDataInfo` 并跳 `/pages/quickLogin/quickLogin`，登录回调（模块 `0177` setUserLogin）再续。支付时 `sale_info` 附 `proxy_pin`/`order_id`，body 加 `payForServiceId`（跨服务区代付）。调度费短链代付走 `izShortLinkOrder=1` 分支（storage `freeDispatchPayDataInfo`）。分享组件 `pagesSub2/pay/components/helpPayShare.js`。
- **「知音指令」隐藏组件**：pay.js `showZhiPassword()` → `getVerificationCode({phone:userInfo.phone})`（`/client/user/user/getVerificationCode`）→ 置 `showZhiCommand=true`，渲染 `pay.wxml` 中固定定位（`top:-200rpx`）的 `<code-btn id="codePlugin" appId="{{aliAppid}}" bizType="<已脱敏：bizType>" data-com-type="wx" extInfo="{{codePluginExtInfo}}">`，extInfo=`{order_id, proxyPin, izZiCodePluginOrder:"1", verificationCode, phone}`——即把**短信验证码与订单信息交给一个 code-btn 插件组件**（bizType 硬编码；appId 取 ext 的支付宝 appid，微信端为空串）。该组件未在 `app-config.json` usingComponents 中注册，疑为小安多端复用的支付宝「知音指令/吱口令」代付能力遗留，微信端实际不可达。
- 钱包抵扣：还车费 `deductWallet`（`/client/rent/return/deductWallet`）、预约费 `reserveDeductWallet`；欠款弹窗（ridePermission action 1005）引导充值页 `/pagesSub/charge/charge`（`sale_type:"WALLET"`、档位 `active_id`、`getConfigRechargeBeforeUse` 拦截、校园卡 CAMPUS_CARD 密码分支）。
- 退款：`applyRefund`/`refundStatus`/`refundDetails`（`/ebike_account/user_refund_recharge/client/*`，页面 `pagesSub/refundableBalance/refundableBalance.js`、`pagesSub2/pay/components/refundIntegrityModal.js`）、押金 `refundDeposit`（`/ebike_pay/pay/client/refund`，页面 `pagesSub/retunDeposit/retunDeposit.js`）。
- 冻结单：pay.js `setFrozonOrder`/`checkFrozen`/`frozenOrderToPay`（订单冻结转支付，冻结倒计时 `cutTimeFun`），「支付停留超时」弹窗（payScoreOrder/wechatPayScoreOrder `popupTitle`）。

## 6.3 行程计费相关接口

- 计费规则：`/client/order/config/get`（getBillingConfig/getRuleConfig，地图页与支付页展示费率）、`/client/order/config/billingRule`（多规则）；
- 行程中：`/client/rent/getRideInfo`（骑行页轮询订单/车辆状态，模块 `ed4c`，节奏见[车辆控制流程](./unlock-return.md)）；
- 预估/结算：`/client/order/preCalculateCost`（还车前预估）、`/client/order/rideCardFreeCost`（骑行卡免费时长抵扣）、`/client/order/detail`、`/client/order/getTrajectory`（轨迹回放，`pagesSub/tripMap`）；
- 调度费/罚款：`/client/userTicket/exemptDispatchFee`、`/client/order/learnAvoidFine`（学习免罚）、`returnPermission` 返回的 `penalty` 字段。
