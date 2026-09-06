---
title: 其他发现与未决问题
sidebar_label: 发现与未决
description: 硬编码凭据汇总（已脱敏）、调试开关、第三方 SDK、Storage Key 全表、日志埋点体系与未决问题。
sidebar_position: 7
---

## 8.1 硬编码密钥/凭据汇总

| 值 | 用途 | 来源 |
|---|---|---|
| `platformSecret: "<已脱敏：platformSecret>"` | /oauth/token Basic 认证口令（tenantId:secret，tenantId=`1534` 为公共 body 参数、保留） | `app-config.json` ext；`common/vendor.js` 模块 `4666` |
| `platformSign: "<已脱敏：platformSign，64 位十六进制>"` | 生产环境 `_s` 签名盐（知音实际生效值） | `app-config.json` ext；模块 `b158` |
| `platformSign: "<已脱敏：platformSign，64 位十六进制>"`（DEV/TEST）、`"<已脱敏：platformSign，64 位十六进制>"`（UAT5） | 测试环境签名盐（**测试环境同样可伪造签名**） | 模块 `b158`（common/vendor.js） |
| juju 广告 `appId:"xiaoan_miniprogram"` / `appSecret:"<已脱敏：juju 广告 appSecret>"` | ad.jujufun.net 广告签名（见[请求与签名](./signing.md)） | 模块 `415e` |
| AES 口令 `<已脱敏：AES 口令>` / 盐 `<已脱敏：AES 盐>`（XOR 0x5A 混淆存储） | 模块 `aef2` AES-256-CBC；**调用方**：`pagesSub2/verified/verified.js`（解密服务端下发的实名姓名/证号密文 encryptionAuthName/No）、`pagesSub2/smsVerification/smsVerification.js`（ext `security:true` 时加密登录手机号/验证码；知音 `security:false` 未启用） | 模块 `aef2` |
| `bizType:"<已脱敏：bizType>"` | pay 页隐藏 `code-btn`「知音指令」组件业务类型（携 getVerificationCode 短信验证码+order_id+proxyPin，微信端组件未注册、疑不可达，见[支付流程](./flows/payment.md)） | `pagesSub2/pay/pay.js`/`pay.wxml` |
| 腾讯位置服务 key `<已脱敏：腾讯位置服务 key>` | ext h5 sdkConfigs（小程序端未用） | `app-config.json` ext |
| `appId:"<已脱敏：ext appId>"` / `appKey:"<已脱敏：ext appKey>"` | 服务商平台凭据（Mongo ObjectId 风格；本包 JS 未见使用点，疑为消息推送/创蓝等服务商侧配置） | ext；模块 `4666` |
| 平安保险保单链接（pNo=`<已脱敏：平安团体保单号 pNo>`，vNo=`<已脱敏：平安团体保单号 vNo>`） | 骑行险保单查询（硬编码团体保单号） | `components/insuranceDetailModal/insuranceDetailModal.js`（模块 `7c6a`） |
| 同盾 `partnerCode:"xiaoantech"` / `appName:"xiaoantech_wxxcx"` | tdfp-plugin 初始化（合作方标识，非密钥） | 模块 `df11` |
| 蓝牙兜底 token `[10,10,5,5]` | getBlueToothToken 失败时的占位 token | 模块 `17bd` |

## 8.2 调试开关

- `app-config.json` 顶层 `"debug": true`（构建配置；ext.debug=false）。
- **环境切换器**（模块 `49c2` `switchDebug`，仅 `envVersion ∈ {develop, trial}` 生效）：可将 `platformTenantId` 改为任意租户、按模块 `b158` envOptions 切换 DEV/TEST/UAT5/PROD1/PROD2/HUAWEI（**同时切换对应 platformSign 与域名**）、强制蓝牙 `onlyBluetooth`、切换人脸渠道 `faceCheckType`。持久化于 storage `DEBUG_RunENV`/`DEBUG_RunTENANTID`/`DEBUG_RunBLE`/`DEBUG_RunFACE`，App onLaunch 自动重放（`common/main.js`）。正式环境（release）该入口被 envVersion 判断禁用。
- `logLevel` 配置（ext=`info`）：置为 `debug` 时请求日志会附带完整 header（含 Authorization/_s）上报（模块 `1244`）。
- 大量 `console.log` 输出 token/key/参数（如 TBIT `_key`、jsCode、openid），BLE key 还会随日志上报至 log-api（见[日志脱敏](./crypto.md)）。

## 8.3 第三方 SDK / 插件

| SDK/插件 | 用途 | 来源 |
|---|---|---|
| `tdfp-plugin`（同盾） | 设备指纹 blackbox，开锁 4 接口 header `deviceToken`，openid 以 MD5 摘要传入 | 模块 `df11`/`789b` |
| `fuiou-pay`（富邦） | 插件支付通道（知音未启用） | 模块 `90b5` |
| CryptoJS（webpack 内置） | SHA256/MD5/HmacSHA256/AES/PBKDF2/Base64 | 模块 `21bf`/`94f8`/`72fe`/`ed53`/`3452` 等 |
| big.js | 金额精度计算（分→元） | 模块 `9dcd` |
| 微信原生能力 | `wx.requestPayment`、`wx.openBusinessView`(支付分)、`wx.requestFacialVerify`/`startFacialRecognitionVerify`(人脸)、`wx.navigateToMiniProgram`、BLE 全家桶、订阅消息 | 各模块 |
| 人脸核身渠道 | **三通道**（`pagesSub/identityAuth/faceScan.js`）：`wechat`（wechatFaceSupport→wx.startFacialRecognitionVerify，结果经 useBikeBeforeFaceCheckByWechat 上报）、`h5`（tencentFaceAuth→**微众银行** ida.webank.com H5 核身 webview，见[第三方主机](./overview.md)）、`haiDun`/`chuangLan`→takePhoto（拍照上传 `useBikeBeforeFaceCheck({image,rentCheckType})`）；知音 ext `faceCheckType:"chuangLan"` → 走 takePhoto 通道 | ext；`pagesSub/identityAuth/*` |
| uniCloud(aliyun) `api.bspapp.com` | uni-app 运行时内置，未见业务调用 | vendor uni 运行时 |
| 广告组件族 | `components/x-ad`、`x-smart-ad-shield`、`x-wx-smart-ad-occupy`、`x-wx-interstitial-ad-occupy`、`x-marketing-popup`（微信流量主 + juju/coral/adwke/泽盛 三方聚合） | components/、模块 `415e` |

## 8.4 Storage Key 全表（storageData 实际使用）

`loginInfo`、`userInfo`、`serviceId`、`openId`、`configData`、`dynamiConfigStorage`、`scanCarId`、`bikeType`、`preAutoOpenCar`、`auto_scan_use_bike`、`registerSource`、`verifiedSuc`、`faceResultSuccessTime`、`hasWxPayScoreConfirmed`、`wechatPayScoreAppid`、`payScoreLimit`、`eBikePayAction`、`helpPayDataInfo`、`freeDispatchPayDataInfo`、`footSupportDispatchReturn`、`showHelmetModal`、`isLimitRiding`、`learningContent`、`guideHistory`、`guideList`、`popupHistoryList`、`popupList`、`oneCardBind`、`needHideServiceAreaWhenOut`、`userCarConfig`、`ads`、`xa_ad_config`、`expStrategyCache`、`reportData`、`DEBUG_RunENV`、`DEBUG_RunTENANTID`、`DEBUG_RunBLE`、`DEBUG_RunFACE`。

## 8.5 日志/埋点体系（模块 `4250` + `523a` + `ecbe`）

- 双通道批量上报：`POST {logApi}/log/app`（REQUEST/SCAN/PAY/BLE/TRACE/EVENT/DEVICE_INFO 等技术日志）与 `/log/event`（startApp/startEbike/scanEbike 等行为埋点），2 秒定时批量，无签名，失败退避（`uploadErrMaxCount`）。
- 日志公共字段：platform、tenantId、version(5.23.0)、sessionId、deviceId、networkType、systemInfo、userInfo(phone/authName 打码)、openId、traceId、elapsedTime、page。
- `traceId` 双体系：请求级 `traceId`（时间戳+随机数，进 body）与场景级 trace（`openBike-userPin-rand7` 等，Vuex `trace` 模块 `8342`，用于开锁/还车/启动全链路埋点串联）。
- `importantAlarmConfig`（模块 `ecbe`）：命中关键字的失败响应强制全量上报（告警）。

## 9. 未决问题

1. **`pagesSub3`/`pagesSub4` 页面实现**：无对应 wxapkg（目录下仅 `.json` 配置）——互动弹窗 interactivePopup、评价提交 review/submit、信用分页 creditScore、骑行任务规则 rideTaskRule、校园一卡通绑定 oneCardBind、公交换乘 busDiscountHome、拍照 AI takePhotoAi（pagesSub3），年度报告 ridingReport/annualRidingReport2024、抽奖 luckyLot/lotteryActivity（pagesSub4）的页面交互细节无法证实（接口定义本身在 `common/vendor.js` 中完整）。
2. **`appId:"<已脱敏：ext appId>"` / `appKey:"<已脱敏：ext appKey>"`**（ext 顶层）：全部已还原代码中未检索到使用点，用途不确定（疑为小安服务商平台的推送/短信/人脸服务商凭据，或供 `pagesSub3`/`pagesSub4` 使用）。
3. **域名池 `-j` / `-y` 后缀**（如 `ebike-client-prod2-j.xiaoantech.com`）：代码未注释含义，推测为多云/多线容灾（如京东云/移动云），未证实。
4. **`payBaseApi: https://pay.xiaoantech.com`**：ext 中声明，但全部已还原 JS 未见直接请求（支付均走业务网关 `/ebike_pay/*`），可能供 `pagesSub3`/`pagesSub4` 或 H5 收银台使用，或为历史遗留。
5. **`code-btn`「知音指令」组件**（见[支付流程](./flows/payment.md)）：`pagesSub2/pay/pay.wxml` 引用但 `app-config.json` usingComponents 未注册该组件，微信端渲染预期失败；其来源插件/多端复用背景无法从本包证实。
6. **同盾 blackbox 内部算法**：在 `tdfp-plugin` 微信插件内（不在包内），无法分析；客户端仅透传 `deviceToken`。
7. **`/client/rent/getEBikeReserveBilling`**：函数存在但 URL 常量缺失（`a.getEBikeReserveBilling` undefined），为死代码，未计入接口总数。
8. **接口计数口径**：总数 344 为「已解析 URL」计数；分包页面未引入任何新端点（无硬编码 URL，全部经 vendor API 模块）。同一 URL 被多模块封装的（如 `/client/rent/buyingOrder`、`/client/tenant/config/list`）按主要模块计一次，去除跨模块重复路径（/client/tenant/config/list、/client/pay/score/getPermissionRecord、/ebike_account/user_account/client/user_account、/client/management/menuClick/izShow、/client/rent/buyingOrder 各出现 2 行）后，唯一业务路径约 339 个（另含 1 个第三方完整 URL）。
