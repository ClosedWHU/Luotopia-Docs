---
title: 车辆控制流程（开锁 / 还车 / 调度）
sidebar_label: 开锁与还车
description: 扫码入口、开锁权限校验、网络/蓝牙开锁、还车与临停、微信支付分免押及骑行页轮询节奏。
sidebar_position: 2
---

核心 mixin：`common/vendor.js` 模块 `7c9e`（useBikeMixins，被 `pages/map` 与分包 `pagesSub/precycling`、`pagesSub2/riding` 混入）。

## 7.1 扫码入口与用车确认页（precycling）

`wx.scanCode`/启动参数 q → `doQrCode`（模块 `0177`）解析二维码 URL：域名必须命中 `qrDomain`（知音 = `ebike-zhiyin.xiaoantech.com`，模块 `d547` checkQrDomain），车辆号提取顺序：查询参数值 → 末段路径 base64 解码为纯数字 → 路径中 ≥4 位数字。随后 `goPreCyclingByEBikeId` 跳转用车确认页 `pagesSub/precycling/precycling.js`（89KB，mixins 含模块 `7c9e`；子页 `precycling/instructions.js` 为用车说明）：
- **扫码埋点**：`submitScanData({carId, userLat, userLng, izRealScan, phone, izAuthPoi})`（`/client/rent/scan`）——`izRealScan` 仅当 `pageSource ∈ {"scan","map_scan"}` 为 true（区分真扫码与页面跳转），`izAuthPoi` 为定位授权状态；
- **页面数据**：`getPreCyclingByEBikeId({carId})`（`/client/rent/getCarInfoData`，mixin 封装，返回含 serviceId 车辆详情），随后并行拉 `getAdConfigV3`、`getHomeActivityEntrance` 等运营位；`pageSource==="pay_recall"`（支付召回场景）时 `promptAndPlayRinging` 提示并播寻车铃；
- **确认用车**：`handleOpenBike` → mixin `7c9e.openBikeV2(carInfo)`（日志 `[precycling] handleOpenBike call openBikeV2 {stage:"E2", carId}`），后续权限校验/网络/蓝牙开锁见 §7.2-7.4；
- 预约用车（bookCar start/cancel/detail）在地图页（模块 `7c9e`/`7661`），precycling 不含预约接口调用。

## 7.2 开锁前权限校验（网络）

`checkRidePermission` → `POST /client/rent/ridePermission`（**header 带同盾 deviceToken**）：
```json
{ "carServiceId": "<服务区>", "carId": "<车辆号>", "userPin": "<pin>",
  "userLat": 30.5, "userLng": 114.3, "agreeCancelBook": false,
  "protocolTypes": [1,2], "tradeNo": "<微信支付分单号，可空>" }
```
响应 `{checkState, action[], tips[]}`。**action 码表**（模块 `7c9e` handleOpenBikeAction）：101 未实名→实名弹窗/页、102 人脸核验（3 分钟内 `faceResultSuccessTime` 免重复）、103 实名信息复核、107 服务区绑定失败→定位异常页、110 黑名单、120 隐私协议、130 用车资格（押金/免押：izRidingType 1=缴押金 2=押金卡）、140 校园一卡通绑定、200 已在骑行→行程页、350 他人预约车、351 车辆号不存在、404 信用分限制、500/501/507/508 系统公告、506 余额不足、509 车辆未备案、1000 未支付订单→支付页、1001 预约未支付、1005 钱包欠款→充值。**tips 码表**：201 远程开锁确认弹窗、9900 支付分失败提示、10000 押金自动代扣确认、10001 头盔弹窗。

## 7.3 网络开锁

`openBikeV2`（含微信支付分免押分支，见 §7.6）→ `POST /client/rent/network/ride`（单车 carType=1 走 `/client/rent/bike/network/ride`；**均带 deviceToken**）：
```json
{ "userLat": 30.5, "userLng": 114.3, "carId": "<车辆号>", "userPin": "<pin>", "bookId": "<预约单ID|''>",
  "izAutoTempParking": true,        // 远程车+自动临停（可选）
  "channelEnum": 14,                // 微信支付分免押单（可选）
  "preferentialCarActivityId": "",  // 优惠车活动（可选）
  "izDepositAutoPayOrder": true,    // 押金自动代扣确认（可选）
  "izSafeRide": false, "izKeepSafeRide": false }   // appendOpenBikeExtParams 安全骑行弹窗状态
```
成功 → `reLaunch /pagesSub2/riding/riding`；**错误码 `17012`（车辆弱网/指令超时）自动降级蓝牙开锁**；`15047` 未备案换车、`15030` 余额不足弹窗。开锁成功后可触发寻车语音 `/client/paas/device/playVoice`。

## 7.4 蓝牙开锁（弱网兜底 / onlyBluetooth 强制）

`openBikeByBLE`（模块 `7c9e`）流程：
1. `checkOpenConfig` → `POST /client/rent/blue/getReturnConfig`（取 `izBeacon` 是否需蓝牙道钉检测）；
2. 道钉检测：ecuType===1（TBIT）→ `40c2.checkBeacon(car)`；否则 → `f417.checkBeacon(imei)`（BLE 指令 `GET_LAST_BEACON_INFO=66`，解析模块 `90ed.resovleLasttBeaconInfo`：beacon 地址/ID/SOC/经纬度/时间戳），结果压入 `result[]`；
3. `bleRidePermission` → `POST /client/rent/blue/ridePermission`（带 deviceToken）：`{carId, izSw:1, userLat, userLng, userPin, result:[{name:"beacon",izExist,canUse,result,state}], bookId}` + izSafeRide 扩展；
4. 取 token 并 BLE 开锁（帧格式与指令协议细节见[蓝牙（BLE）指令"加密"](../crypto.md)）：TBIT → `67ed.start("open", carDetail)`（token=ecuToken 或 `/client/rent/blue/getTbitBlueToken {carId}`）；小安锁 → `f417.openBike(imei)`（token=`/client/paas/device/getBlueToothToken {imei}`，指令 `START=44`）；
5. 结果上报 `reportOpenBikeByBLE` → `POST /client/rent/blue/ride {carId, userLng, userLat, userPin, preferentialCarActivityId?, izDepositAutoPayOrder?, izSafeRide, izKeepSafeRide}` → 成功进入骑行页。

## 7.5 还车 / 临时停车 / 头盔锁

1. **还车前置**：`returnPermission`（`POST /client/rent/returnPermission`）→ `{izCanReturn, returnType, penalty, izFaceAuthPass, helmetLockDelayRemainingSeconds, carType,…}`；`izFaceAuthPass=false` 时还车需人脸（跳 `pagesSub/identityAuth`，storage `returnNeedFace`）；头盔锁刚开启需等待 5 秒；returnType 1103=站点已满→拍照还车（`pagesSub/applyReturnEbike`），2291=拍照引导（`pagesSub2/takePhotoGuide`）。
2. **网络还车**：`returnByNet`（`POST /client/rent/network/return`；普通单车 `returnBikeByNet` → `/client/rent/bike/network/return`），成功结算进入支付页；`returnBikeAlwaysFirstNet` 配置可强制先走网络。
3. **蓝牙还车**：TBIT `close` 指令（`03 00 01 01 01`）或小安锁 `LOCK=43`，随后 `reportReturnBikeByBLE` → `POST /client/rent/blue/return`：
   ```json
   { "izFrontSupportRfidFullPile": true, "orderId": "<订单>", "carId": "<车辆>", "izSw": 1, "returnType": 3,
     "userLng": 114.3, "userLat": 30.5, "userPin": "<pin>", "result": [], 
     "izFrontSuppotFullPile": true, "izFrontSupportFaceAuth": true, "izChargePile": true }
   ```
4. **拍照/AI 还车审核**：`queryReturnBikeAudit`（izCapable）→ `createReturnEbike`/`createAuditAndReturn`（`/client/returnBikeAudit/*`、`/client/rent/network/createAuditAndReturn`）；AI 识别 `POST /client/vlm/return_car/generate`；是否在停车点 `izInParking`；部件匹配 `partMatch`/`partMatchByTempParking`；四色车拍照校验 `colorCheck`（`/client/rent/part/fourColor/check`）。
5. **临时停车**：`tempPark`（`POST /client/rent/tempParking`）→ 临停中 `tempUnlock`（`POST /client/rent/tempUnlock`）继续骑行 / `endTempPark`（`POST /client/rent/endParking`）结束；次数限制 `tempParkingTimesCheck`；蓝牙对应 `blue/tempParking`、`blue/endParking`；配置 `getTempUnlockConfig`。
6. **头盔锁**：`unlockHelmet`/`lockHelmet`（`/client/helmet/unlock|lock`）；头盔照片 `uploadHelmetImage`（`/diy/orders/images/bind`）；头盔弹窗素材 ext.customDiy.helmetLockVideo。
7. **调度/寻车（用户侧）**：寻车语音 `/client/paas/device/carSearchVoice`、开锁后铃声 `/client/paas/device/playVoice`、运营寻车 `/ebike_operation/tools/business/car_searching`；调度费免除 `/client/userTicket/exemptDispatchFee`。

## 7.6 微信支付分免押（开锁链路内嵌）

`openBikeV2`（模块 `7c9e`）在开锁前处理三种状态：
- `wxPayScoreType==1 && wxPayScoreLeftExpireTime==0 && !hasWxPayScoreConfirmed`：`wechatPayScoreConfirmChannel`（`/client/pay/score/getWxScorePayScoreDepositedConfirmChannel`）→ 需确认则 `createOrderConfirm`（`/client/pay/score/createOrderConfirm`）返回 `{mchId, packageStr, timeStr, nonceStr, signType, signStr, outTradeNo, miniProgramAppid}` → `wx.openBusinessView({businessType:"wxpayScoreUse", extraData:{mch_id, package, timestamp, nonce_str, sign_type:"HMAC-SHA256", sign}})`，`outTradeNo` 存为 `wechatPayScoreTradeNo` 并随 ridePermission 的 `tradeNo` 上传；
- 未开通支付分但已授权：`getWechatPayScoreRecord`（hasAuthPayScore）→ `createWechatPayScoreOrder`（`/client/pay/score/createOrder`）得 tradeNo，开锁时 `channelEnum=14`；
- 首次开通：`scorePermission({code})`（`/client/pay/score/permission`）→ `wx.navigateToMiniProgram({appId:"wxd8f3793ea3b935b8", path:"pages/use/enable", extraData:{apply_permissions_token}})`；回跳（scene 1038）由 `common/main.js` onShow 捕获写入 Vuex `tempData/setWxScorePayConfirm`；
- 完结/取消：`completeOrder`、`queryWxScoreOrder`、`cancelWeChatPaySocre`（`/client/pay/score/cancelOrder`）、解约 `closeScorePermission`。

## 7.7 骑行页轮询节奏（pagesSub2/riding/riding.js）

- **getRideInfo 轮询 = 每 10 秒**（`E=setInterval(…, 1e4)`），页面加载/显示时先立即调一次；请求参数：`{izFrontSupportRfidFullPile:true, izNoHelmetPopup:true, userLat, userLng, userPin, version:"5.23.0", izRefresh}`；另有轻量 `onlyGetRideInfo`（`izRefresh:true`，Promise 化静默刷新）。
- **乱序防护**：每次请求携带递增序号 `U`，回调校验 `r===U`，不匹配则记日志「loop响应顺序异常，数据丢失」丢弃；首包成功记「init响应顺序正常」。
- **异常分支**：`code==15042` 直接忽略本轮；失败且订单已结束 → `clearInterval` 停表、`getOffRideLine()` 清理路线，若仍在骑行页则 1 秒后 `redirectTo /pagesSub2/pay/pay?orderId=<orderId>&from=inside` 进入结算；获取失败弹窗确认后 `reLaunch /pages/map/map`。
- **本地秒表**：另一个 `_=setInterval(…, 1e3)` 每秒 `rideTime++` 并执行 `countTempParking()`（临停计时，`ridingState===3` 判定临停中）；init 成功后 `rideTime = parseInt(data.rideTime)/1e3` 校准。
- 初始化并行拉取：`getRidingCardInfo`、`initReturnCarConfig`（returnPermission/getbackCarConfig 链路）、`initRidingCardList`（卡推荐 `reportRidingViewCard`）、`getConfigReturnCarLearnFineFree`（学习免罚）、`getRepairConfigList`（骑行中报修入口，见[报修/违章接口](../api/repair.md)）；生成 `traceId(scene:"returnBike")` 串联还车埋点。
