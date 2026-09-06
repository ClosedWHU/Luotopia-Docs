---
title: 开锁、骑行与还车流程
sidebar_label: 开锁与还车
description: 车辆状态通道（无长连接、HTTP 轮询）与扫码开锁、骑行中控制、还车结算、调度费及订单状态枚举的端到端流程。
sidebar_position: 2
---

## 车辆状态通道（源文档 §6「长连接协议」：结论为无长连接，HTTP 轮询）

**结论：不存在长连接。**

排查依据：

1. 全仓库（含 `app-service.js`、`packages/business/app-service.js`、两个插件段）grep `wss://` / `ws://` **零命中**。
2. grep `wx.connectSocket` / `SocketTask` / `onSocketMessage` / `sendSocketMessage` / `closeSocket` **零命中**。唯一大量出现的 `WebSocket` 字样是小程序 `define(...)` 包装函数的**形参名列表**（`function(require, module, exports, window, document, frames, self, location, navigator, localStorage, history, Caches, screen, alert, confirm, prompt, XMLHttpRequest, WebSocket, Reporter, webkit, WeixinJSCore)`），是微信运行时的沙箱参数占位，与业务无关。
3. `lib/conn/conn.js` 名字有误导性，**它不是连接层**，而是企业微信插件的日志工具：

```js
// lib/conn/conn.js
var e = {};                       // exports.conn
var r = !0;                       // 日志开关
var n = function () { return "[" + o(new Date, "%Y-%M-%d %h:%m:%s", !0) + "]" };
var o = function (e, r, n) { /* 自实现 strftime：%Y %M %d %h %m %s */ };
["log","info","warn","error","assert","dir","clear","profile","profileEnd"]
  .forEach(function (o) {
    e[o] = function () {
      var e = "";
      r && (e = arguments, e.length > 0 && (e[0] = n() + JSON.stringify(e[0])),
            console[o].apply(console, e));
    };
  }, Function.prototype.bind);
e.enableConsole = function (e) { r = !!e };
exports.default = { conn: e };
```

即：给 `console.*` 加时间戳前缀的包装器 + `enableConsole(bool)` 开关。仓库内仅 `lib/storage/storage.js` 的 `clearStorage` catch 分支用到 `t.default.log(e)`。**与车辆状态推送毫无关系。**

4. 车辆/订单状态实际靠 **HTTP 轮询**：

| 轮询 | 周期 | 接口 | 来源 |
|---|---|---|---|
| 进行中订单 | **10 s** | `GET /miniMango/v1/order/order/processing` | `pages/index/index.js` `checkTimeOut()` → `setInterval(this.fetchCurrentOrder.bind(this), 1e4)`；`onShow` 里 `this.timerTimes || this.checkTimeOut()` |
| 预约状态 | **30 s** | `GET /miniMango/v1/order/order/reservation` | `pages/index/index.js` `onLoad` → `setInterval(() => s.fetchReservationOrder(), 3e4)` |
| 地图线要素同步 | 2 s | 纯本地 `setData`（无网络） | `pages/index/index.js` `onLoad` |
| 首页公告同步 | 3 s | 纯本地（读 `globalData.homePageAnnouncement`） | `pages/index/index.js` `onShow` `_homeNoticeTimer` |
| 企业微信客服 ID | 1 s（拿到后 `t=true` 停止） | `GET /miniMango/v1/setting/wxkfAccount/getOne` | `pages/index/index.js` `onShow` |
| 救援倒计时 | 1 s | 纯本地倒计时，归零时 `fetchCurrentOrder()` | `pages/index/index.js` `_startRescueCountdown` |
| 扫码态等待 | 1 s（`clearInterval` 条件满足后停） | 纯本地轮询 `globalData` | `pages/index/index.js` `onLoad` |
| 地图 `regionchange` 结束 | 800 ms 节流 | `GET /operation/parkingLot/near` | `pages/index/index.js` `regionchange` → `serchParkLot()` |

`onHide` 只清 `_homeNoticeTimer`，**不清 `this.timer`（10s 订单轮询）与 30s 预约轮询**；`onUnload` 也不清（只清救援相关定时器）。配合 `app.json` 的 `requiredBackgroundModes: ["location"]` 与 `scope.startLocationUpdateBackground`，小程序在后台仍持续定位并轮询订单 —— 这是骑行中保持状态更新的实现方式，代价是后台常驻网络请求。

5. 定位推送方向是**客户端 → 服务端**：`utils/encapsulation/WXFeature.js` `listenLocationChange()` 调 `wx.startLocationUpdateBackground()` + `wx.onLocationChange(cb)`，回调只更新 `globalData.location`（供下一次请求的 `mg-dvi` 与 `center` 使用），**不主动上报**。没有单独的轨迹上传接口；轨迹由服务端根据订单 `route` 自行计算（前端只读 `order.route.distance` 与 `route.end.lngLat`）。

## 8. 车辆控制流程（端到端）

### 8.1 扫码开锁

```text
[入口 A] 微信扫小程序码 → pages/loginPre?scancode=xxx 或 pages/index?q=<encoded>
         → globalData.scanCode = 车牌号
[入口 B] 首页/开锁页点「扫码」→ pages/readyUnlock → _scanner()
         → checkRealNameAuthentication() && getSystemLocation()
         → wx.scanCode() → result 含 "=" 取 split("=").pop()，否则 split("/").pop()
[入口 C] 手输车牌 → pages/enterNumber → globalData.enterNumber → readyUnlock.onShow 消费

pages/index/index.js scannerCheckoutAccount(null, code)
  1. !loginStatus            → 弹窗「您还未登录 / 去登录」→ pages/login
  2. deposit === 0 && !isFreeDeposit → navigateTo pages/deposit?needBuyType=deposit
  3. hasUnpayOrder           → 弹「您有调度费或租金未付」→ goTopay() → _recharge(hasUnPayAmount)
  4. regionId === "2408241137969"（武汉大学）且 !WHShowDialogNotFirst
                             → 弹「信息对外提供授权协议」（confirmText="不同意" / cancelText="同意"，
                               反转按钮语义）→ PUT /account/user/license {id:"5a13efac…", state:!confirm}
  5. → navigateTo pages/readyUnlock/readyUnlock?code=<车牌>

pages/readyUnlock/readyUnlock.js getStock(code, isScanQR)
  → checkUserLocationSetting()（未授权则弹「请先开启位置服务」→ wx.openSetting）
  → GET /ebike/stock/number?number=<code>&isScanQR=<bool>
     ├─ replaceRegion 存在 → 用新运营区覆盖 globalData 全套配置（跨区骑行）
     ├─ needPayDeposit     → 跳押金页，支付成功后 eventChannel 回放 getStock
     ├─ state === 6        → findLostTraction.show(data)（车辆报失，悬赏 findLostAward 元）
     └─ 正常 → 写 ebikeRegionId / helmetLock / isWuhanStock
               hasCharterCard = charteredEbikeCard.hasCard
               charterList    = charteredEbikeCard.config
               计价：priceTrans.timeUnit/100（元/分钟）、priceTrans.mileageUnit/100、
                     price.floorCost/100（起步价）、price.baseTimeUnit、discountRateTrans
               rideBackFree = stock.outsideRegion && enableDispatchCost
                              && stock.region === globalData.regionId && freeOrderTimeLimited.freeTrip > 0
               → start 组件弹出「开始骑行」面板（含包车卡选项）

onStart()  → 200ms 防抖 → checkUserLocationSetting
           → GET /record/illegalPark/valid
              ├─ 有 endTime → 弹「停用提醒：因您上次未规范停车，已被限制停用三天」→ 终止
              └─ 无         → _confrimEvent()

_confrimEvent()
  ├─ 选了包车(charterWay) 且 !hasCharterCard
  │    → POST /finance/ticket/charteredEbikeCard {region, channel, openid, amount}
  │    → wx.requestPayment(charge) → GET /finance/ticket/{ticket._id}/check
  │    → paid → globalData.hasCharterCard = true → unlockBike()
  └─ 否则 → unlockBike()

unlockBike()
  → showLoading(helmetLock ? "开锁中,请耐心等待～" : "正在开启")
  → POST /order/order { num: <车牌> }
     ├─ fail    → 关闭 start 面板
     └─ success → 若返回 outsideRescue + order → globalData.pendingOutsideRescue = {orderId, ...}
                  globalData.event.emit("create_order_end")   → 首页 showLoading("车况检查中……") + fetchCurrentOrder + runningIsShow=true
                  globalData.event.emit("un_lock")            → 首页 showDoubleBrace（双刹提示，可 storage 关闭）
                  wx.navigateBack({ delta: 2 })               → 回首页进入骑行态
```

### 8.2 骑行中

```text
pages/index/index.js onShow → fetchCurrentOrder()，并由 checkTimeOut() 挂 10s 定时器
GET /order/order/processing
  → boxId = order.box, stockNo, orderId
  → totalDuration / totalDurationByLock（临时锁车期间时长单独计）
  → mileage = stock.battery.mileage/1000 km, distance = order.route.distance/1000 km
  → money   = order.payInfo.rent.finalTotal/100 元
  → isLock  = order.lock.isLocked
  → isCharterOrder = !!order.charteredEbikeCard
  → ignoreHelmetCheck = order.ignoreHelmet
  → userRealTarget / discountParkingLotInfo（已绑定的优惠停车点）
  → _handleRescueState(data)：
       outRegionReturnTip = "区外还车收X元区外调度费"（newParkingInfo.info.dispatch）
       rescue.active      → 启动倒计时 + 画「车→nearestFencePoint」蓝线
       rescue.available   → 展示「临时启动」按钮
       都没有且曾经 active → 弹「车辆已恢复断电 / 临时启动机会已用完，请将车辆推回服务区」
  → 若 order.box 存在 → GET /ebike/box/{boxId}
       hasHelmetLock && !helmetOptions.helmetIsLost  → hashelmetLock = true
       或 helmetIsLost.userCanOpenHelmetLock         → hashelmetLock = true

骑行中可用的车辆控制：
  • 临时锁车   onTemporaryLock → TemporaryLockDialog → onLock
               → 若 hashelmetLock：PUT /ebike/box/{boxId}/command {command:6, param:{}, dataSource:6}
                  ← data.stockBooleanState.helmetStay 或 status.helmetReact 为真才放行，
                    否则 hideLoading + toast「头盔未归还」
               → 若 rescue.active || rescue.available → toast「车辆救援中不能临时锁车」，直接拦截
               → PUT /order/order/lockWithExpires {expires:40} → isLock = true
  • 重新开锁   onUnlockPop → Dialog「确认开锁吗?」→ onUnlock → PUT /order/order/unLock → isLock = false, scale=17
  • 手动开锁   unlock()（头盔盒场景）→ PUT /ebike/box/{boxId}/command {command:17, param:{}, dataSource:6}
               → toast「开锁成功」
  • 区外救援   onOutsideRescue → POST /order/order/outsideRescue {}
               ← {expiresAt, remainingSeconds, distance, durationSeconds, nearestFencePoint}
               → 倒计时 + 画线 + 弹「已为你临时通电，请在 N 分钟内骑回服务区」
               → 若 freeOrderTimeLimited.freeTrip > 0，文案追加「骑回服务区内还车免前X分钟时长费」
               → _rescueRequesting 互斥，防重复点击
  • 关闭头盔检测 onClickHelmetErrorHandler（!ignoreHelmetCheck 时）
               → 弹窗「30天内仅允许两次」→ POST /order/order/cancelHelmet {}
               → ignoreHelmetCheck = true, hashelmetLock = false
  • 还车点导航  serchParkLot → getParkingLots(地图中心) → GET /operation/parkingLot/near
               → 停车区/禁停区 polygon + 车辆 markers（discountRate 决定图标 stock_d0..d9）
               → routeToParkingLotDiscount → 分包 recommendedParkingLot
  • 预约       reservationSubmit POST/GET/DELETE /order/order/reservation
  • 摆车任务   pages/stockHelpJob：GET /ebike/stock/help?carNo → 拍照上传 → POST /ebike/stock/help/job
```

### 8.3 还车（结束行程）

```text
onCompleteOrderPopUp
  ├─ isCharterOrder → 先弹 showCharterTip（包车提示）→ charterBeforeFinish
  └─ → fetchCurrentOrder(cb) = PUT /order/order/snap      ← 还车前判定快照
        cb(newParkingInfo.info, order) = finishAlert(info, order)

finishAlert(e, t)  —— 纯前端文案决策，依据 e.bubbleContent 的字符串匹配：
  t.isBad                                  → 文案「问题行程 / 知道了」
  bubbleContent 含 "服务区外"               → 「知道了」；若 e.dispatch 存在
                                              → 「支付X元调度费还车」+ alertTitle="当前在服务区外"
                                              + _outRegionDispatchReturn = true（还车时带 payOutRegionReturn:true）
  bubbleContent 含 "暂停运营"               → 「需要挪车 / 知道了」
  bubbleContent === "停车区内"
     ├─ region.enablePhotograph && !enablePhotographClose
     │      → 「拍照并结束行程」，showPhotoExplain=true，finishBtnState = isUploadImgFull()
     │        文案「拍照规范还车，审核通过将发放优惠券，可在下次骑车时使用」
     └─ 否则 → 「结束行程 / 再想一想」
  bubbleContent === "停车区外"  → 按 operationPattern 三分支：
     0 → alertContent="停车区外不能停车哦"，按钮「知道了」（禁止还车）
     1 → region.enablePhotographClose
          ? 「结束行程」+ "停车区外停车需要收取调度费"
          : 「拍照并结束行程」+ "…由于信号定位存在误差, 可尝试拍照还车, 系统10分钟内审核，通过后会返还调度费"
     2 → 「结束行程」+ "停车区外停车有可能收取调度费"
  → endDialog.setData({isShow, title, content, cancelText, confrimText, event:"completeOrderEvent",
                       inParkLot, finishBtnState, img: uploadImg})

拍照还车（如需要）：
  shootImg / takePhoto → wx.createCameraContext().takePhoto({quality:"high"})
  → uploadFile /oss/dispatchWorkOrder（表单字段 file）← JSON字符串 {cdnUrl}
  → uploadImg = [cdnUrl]，endDialog.finishBtnState = isUploadImgFull()

_endDialogSubmit → completeOrder(_outRegionDispatchReturn ? {payOutRegionReturn:true} : {})

completeOrder(body)  —— async，先 await refreshWxLocation()（强制刷新定位），再 showLoading("行程结束中")
  ├─ isUploadImgFull() 为真（有照片待提交）
  │    → PUT /order/order/takePhotoFinishOrder {orderId, photos}
  │       ├─ success → uploadImg 清空 → PUT /order/order/finish {…body}
  │       └─ fail    → toast「图片上传失败」
  └─ 否则 → PUT /order/order/finish {…body}

PUT /order/order/finish 的失败分支（服务端通过 response 里的开关驱动前端）：
  allowForcedReturn      → 弹「多次还车失败 / 系统多次还车失败，是否强制还车，最终结算费用有可能有些许浮动」
                            → forceReturnOrder() → completeOrder({forceReturn:true})
  allowPhotoAppeal       → 弹「停车识别未通过 / 多次检测未通过，您可以拍摄车辆停放照片后直接结束订单
                            （不额外收取费用，照片将由人工审核）」→ startPhotoAppeal()
                            → wx.chooseImage(count:1, compressed) → upload /oss/dispatchWorkOrder
                            → completeOrder({skipParkingRecognition:true, appealPhotos:[cdnUrl]})
  parkingPrompt          → 弹「温馨提示 / 本车具备AI识别，需要将车停放在马路牙子上，谢谢配合」
  orderFinished          → 静默关闭所有弹窗（订单其实已结束）
  其余                   → toast「行程结束失败，多次失败请寻找客服帮助~」

成功分支：
  orderId / accountBottom(dispatchCost?900:580) / positionBottom(dispatchCost?821:500)
  money = payInfo.rent.finalTotal/100
  isInParkingArea   = !!payInfo.dispatchCost
  dispatchCost      = payInfo.dispatchCost>0 ? dispatchCost/100 : dispatchCouponCost/100
  schedulingFree    = payInfo.dispatchCouponCost/100      （调度费减免券）
  newerPreferential = payInfo.newUserReductionCost/100    （新人立减）
  isMergedDispatchCost / isCharterOrder / charterAmount = charteredEbikeCard.amount/100
  state === 8 → hasUnpayOrder=true, hasUnPayAmount = payInfo.rent.finalTotal
  forceReturnOrder || parkingAreaReturnDiscount > 0
      → 展示「强制还车/停车区返还优惠」抽屉（MGOrderPayDetailDrawer）
        + 埋点 mini:package:business:recommendParkingLot:hadDiscount {orderId, free, total}
  否则 → settleShow=true + MGTripSettlePanel（评价 + 骑行卡推荐 + 支付）
  depositUpgrade → navigateTo webView(押金购卡活动)&token=<jwt>&orderId=<id>
  finishOrderDisplay === 0 → isFirstOrder（首单）
  finishOrderDisplay 文案四选一：
      isFreeDeposit ? (余额够 ? "快速充值" : "充值支付")
                    : (余额够 ? "下载APP享更多优惠" : "下载APP充值支付")

还车失败兜底页 pages/lockBike/lockBike?orderId=<id>
  → handleLock → PUT /order/order/finish（无 body）
  → handlePhotoLock → 拍照 → /oss/dispatchWorkOrder → 再走 endDialog 结束行程
```

### 8.4 调度费与停车点优惠

- 运营区配置（`GET /operation/region/intersect`）决定计费模型：`operationPattern`（0 禁停 / 1 收调度费 / 2 停车优惠）、`parkingPattern`、`dispatchCost`（停车区外）、`outRegionDispatchCost`（服务区外）、`enableDispatchCost`、`parkingDiscount{rate, content}`。金额字段服务端以**分**下发，前端统一 `/100`。
- `freeOrderTimeLimited.freeTrip`（分钟）用于「区外车骑回区内还车免前 N 分钟时长费」，前端据此计算 `rideBackFree` 并在救援弹窗里追加文案。
- 优惠停车点闭环：骑行中 → `MGParkingLotDiscountModal` → 分包 `recommendedParkingLot` → 选目的地（geovisearth POI/联想，前端用 `packages/business/utils/GEO/coordTransform.js` 做坐标系转换、用射线法 `computeSuggestionItemStatus` 判定「运营区内 / 临近运营区边缘 / 运营区外 / 无运营区」）→ `GET /operation/parkingLot/planning` 推荐停车点 → `POST /order/order/parkingLotDiscount {parkingLotId, target}` 绑定 → `GET /operation/parkingLot/navigation` 画线 → 首页 `userRealTarget` + `ParkingLotDiscountTarget` → 还车时 `payInfo.parkingAreaReturnDiscount` 体现返还。
- `rejectedOrders`（`GET /account/user`）驱动首页「调度费被拒/返还」轮播（`dispatchDeductionTip`，3s 切换），一次性（`rejectedOrdersPop` 落 storage）。

### 8.5 订单状态枚举与费用字段全表

**订单状态 `order.state`**（`pages/journeyDetail/journeyDetail.js` `getOrderState()`，同一套枚举也解释了前面几处魔法数字）：

| state | 含义 | 相关逻辑 |
|---|---|---|
| 0 | 租用中 | 进行中订单，首页 10s 轮询的对象 |
| 1 | 异常结束 | — |
| 2 | 已完成 | `MGOrderPayDetailDrawer` 的 `isPaid = orderSource.paid \|\| state === 2` |
| 3 | 超时结束 | — |
| 4 | 长时无移动结束 | — |
| 5 | 后台结束订单 | — |
| 6 | 系统结束订单 | **注意与 5.2 中 `getStock` 返回的 `state === 6`（车辆报失，走 `findLostTraction`）不是同一个字段的枚举** —— 后者是接口响应顶层的 `state`，`utils/util.js` 里 `6 !== (s||{}).state` 会抑制错误 toast |
| 7 | 禁停区结束 | 对应 `payInfo.noParkingDispatchCost` |
| 8 | 未支付 | 还车后 `state === 8` → `hasUnpayOrder = true`、`hasUnPayAmount = payInfo.rent.finalTotal`，首页弹「您有调度费或租金未付」，扫码被拦，必须先 `_recharge()` 补付 |
| 其他 | 状态异常 | — |

`components/MGOrderPayDetailDrawer/MGOrderPayDetailDrawer.js` 用两个声明式数组把服务端字段与中文标签一一对应，是还原计费模型最直接的证据。该组件自身**不发任何请求**，数据由首页把 `order` 作为 property 传入（`update()` 重新计算）。

非金额字段在 `orderInformationFields` 里，通过 `base` 指定除数：

| 字段 | 标签 | 换算 |
|---|---|---|
| `route.distance` | 里程 | `base: 1000` → KM |
| `lease.totalDuration` | 用时 | `notPrice: true`，原值即分钟 |

金额字段在 `payDetailFields` 里，单位均为**分**，`getFiledInfo()` 统一 `parseFloat(v)/ (base||100)` 后 `toFixed(2)`：

| `payInfo` 字段 | 前端标签 | 显示规则 |
|---|---|---|
| `rent.total` | 骑行花费 | `always`（恒显示） |
| `rent.finalTotal` | — | 实付租金，写入 `needPayAmount`；`state===8` 时即 `hasUnPayAmount` |
| `helmetDispatchCost` | 头盔未归还花费 | 有值才显示 |
| `noParkingDispatchCost` | 禁停区还车花费 | 有值才显示 |
| `dispatchCost` | 调度费用 | `always` + `mergedHidden` |
| `outRegionDispatchCost` | 大区外调度费用 | `always` + `mergedHidden` |
| `parkingAreaReturnDiscount` | 优惠停车区减免金额 | `prefix:"-"`（负数展示） |
| `dispatchCouponCost` | 调度费减免金额 | `prefix:"-"` |
| `freeHelmetDispatchCost` | 头盔未归还减免金额 | `prefix:"-"` |
| `freeNoParkingDispatchCost` | 禁停区还车减免金额 | `prefix:"-"`，说明文案取 `freeNoParkingDispatchReason` |
| `newUserReductionCost` | 新人优惠减免金额 | `prefix:"-"` |
| `totalAmount` | — | 订单总额（行程列表/详情用） |
| `isMergedDispatchCost` | — | 为 `true` 时隐藏 `dispatchCost` 与 `outRegionDispatchCost` 两行（`mergedHidden`），即调度费已合并计入租金，避免重复展示 |

由此可还原计费构成：

```text
应付 = rent.finalTotal
     + helmetDispatchCost        （头盔未归还罚费）
     + noParkingDispatchCost     （禁停区还车罚费）
     + dispatchCost              （停车区外调度费）
     + outRegionDispatchCost     （运营区外调度费）
     - parkingAreaReturnDiscount （还到指定优惠停车区的返还）
     - dispatchCouponCost        （调度费减免券）
     - freeHelmetDispatchCost    （头盔罚费减免）
     - freeNoParkingDispatchCost （禁停罚费减免，附 reason 文案）
     - newUserReductionCost      （新人立减）
```

显示开关规则（`setValue()`）：`visible = always || parseFloat(value) !== 0`，即**没有 `always` 标记的费用项为 0 时整行隐藏**；`isMergedDispatchCost === true` 时额外把带 `mergedHidden` 的两行强制 `visible = false`。`descFrom` 机制会把 `freeNoParkingDispatchReason` 的文案包成 `[...]` 附在对应行下方。

另外两处细节：`needPayAmount` 只取 `payInfo.rent.finalTotal/100`（不含各项罚费/减免，说明「待支付金额」就是租金部分）；`isPaid = (order.orderSource||{}).paid || order.state === 2`；`confirm()` 有 300ms 的 `lockState` 防重入（连点 toast「您点的有点快哦~」）；`needHelper()` 走 WebView 打开承满点客服，URL 同样明文带 `phone` 与 `region`。

`isMergedDispatchCost` 说明服务端存在两种账目形态：**分列**（调度费单列）与**合并**（调度费折进 `rent`）。前端只做展示切换，不参与计算 —— 所有金额都由服务端算好下发，客户端无法通过改本地数据影响计费，但也意味着**还车失败重试（`forceReturn:true`）时的最终金额完全由服务端决定**，前端文案已明示「最终结算费用有可能有些许浮动」。

另有两处非 `payInfo` 的金额来源：
- `charteredEbikeCard.amount`（包车卡费用，单独一行展示，`isCharterOrder = !!order.charteredEbikeCard`）；
- `order.depositUpgrade`（还车后触发的「押金购卡」升级引导，跳 H5 且 URL 带 JWT）。
