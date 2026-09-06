---
title: 其他发现与未决问题
sidebar_label: 发现与未决
description: 硬编码凭据类别汇总（值与定位已移除）、调试开关、第三方 SDK、Storage Key 全表、日志埋点体系与未决问题。
sidebar_position: 7
---

## 硬编码密钥/凭据汇总

客户端包内硬编码的凭据**类别**如下（所有值与定位信息——模块 ID、文件路径——均已移除，存档于私有仓 `whu-ebike-re`）：

| 类别 | 用途 | 风险 |
|---|---|---|
| 平台签名盐（platformSign，分环境多套） | `_s` 请求头签名盐（生产环境值为知音实际生效值） | 高：盐随包分发、可离线伪造签名；测试环境盐同样泄露（见[请求签名](./signing.md)） |
| OAuth2 客户端口令（platformSecret） | 登录/刷新接口的客户端认证口令（tenantId=`1534` 为公共 body 参数、保留） | 高：OAuth2 客户端凭据随包分发 |
| 第三方广告 appId/appSecret（juju） | 广告接口独立签名 | 中：第三方凭据硬编码 |
| AES 口令/盐（混淆存储） | 实名字段解密；登录敏感字段加密（开关未启用） | 高：服务端用其加密实名信息，等同明文下发（见[加密模块](./crypto.md)） |
| 隐藏支付组件 bizType | pay 页隐藏 code-btn 组件的业务类型（组件未注册、疑不可达，见[支付流程](./flows/payment.md)） | 低 |
| 腾讯位置服务 key | ext h5 sdkConfigs（小程序端未用） | 低 |
| 服务商平台 appId/appKey | 疑为消息推送/短信/人脸等服务商侧配置（包内未见使用点） | 中 |
| 平安团体保单号（pNo/vNo） | 骑行险保单查询链接硬编码 | 低 |
| 设备指纹合作方标识 | 同盾插件初始化配置（非密钥；配置值存档于私有仓） | 低 |
| 蓝牙兜底 token 占位值 `<已脱敏>` | 蓝牙 token 获取失败时的占位（协议细节存档于私有仓） | 中 |

上述凭据属**实际可利用的密钥/盐值暴露**（弱点类别：客户端信任边界失守）。

## 调试开关

- `app-config.json` 顶层 `"debug": true`（构建配置；ext.debug=false）。
- 存在**发布版禁用的调试环境切换器**（仅开发/体验版生效）：可切换租户、多环境网关与对应签名盐、强制蓝牙模式、切换人脸渠道，并在 App 启动时自动重放持久化的调试状态（持久化 storage key 与实现细节存档于私有仓 `whu-ebike-re`；弱点：调试面在包内完整保留，仅靠 envVersion 判断禁用）。
- 存在**凭据日志开关**：日志级别置为调试档时，请求日志会附带完整请求头（含认证与签名头）上报（弱点；知音生产配置为 info，发布版默认不触发）。
- 大量 `console.log` 输出 token/jsCode/openid 等敏感参数，蓝牙 token 还会随日志上报至日志服务器（见[日志脱敏](./crypto.md)）。

## 第三方 SDK / 插件

| SDK/插件 | 用途 |
|---|---|
| `tdfp-plugin`（同盾） | 设备指纹 blackbox，开锁链路接口请求头附加 `deviceToken`，openid 以 MD5 摘要传入（合作方配置存档于私有仓） |
| `fuiou-pay`（富邦） | 插件支付通道（知音未启用） |
| CryptoJS（webpack 内置） | SHA256/MD5/HmacSHA256/AES/PBKDF2/Base64 |
| big.js | 金额精度计算（分→元） |
| 微信原生能力 | `wx.requestPayment`、`wx.openBusinessView`(支付分)、`wx.requestFacialVerify`/`startFacialRecognitionVerify`(人脸)、`wx.navigateToMiniProgram`、BLE 全家桶、订阅消息 |
| 人脸核身渠道 | **三通道**（`pagesSub/identityAuth/faceScan.js`）：微信原生人脸、微众银行 H5 核身 webview（见[第三方主机](./overview.md)）、拍照上传通道；知音 ext `faceCheckType:"chuangLan"` → 走拍照通道 |
| uniCloud(aliyun) `api.bspapp.com` | uni-app 运行时内置，未见业务调用 |
| 广告组件族 | `components/x-ad`、`x-smart-ad-shield`、`x-wx-smart-ad-occupy`、`x-wx-interstitial-ad-occupy`、`x-marketing-popup`（微信流量主 + juju/coral/adwke/泽盛 三方聚合） |

## Storage Key 全表（storageData 实际使用）

`loginInfo`、`userInfo`、`serviceId`、`openId`、`configData`、`dynamiConfigStorage`、`scanCarId`、`bikeType`、`preAutoOpenCar`、`auto_scan_use_bike`、`registerSource`、`verifiedSuc`、`faceResultSuccessTime`、`hasWxPayScoreConfirmed`、`wechatPayScoreAppid`、`payScoreLimit`、`eBikePayAction`、`helpPayDataInfo`、`freeDispatchPayDataInfo`、`footSupportDispatchReturn`、`showHelmetModal`、`isLimitRiding`、`learningContent`、`guideHistory`、`guideList`、`popupHistoryList`、`popupList`、`oneCardBind`、`needHideServiceAreaWhenOut`、`userCarConfig`、`ads`、`xa_ad_config`、`expStrategyCache`、`reportData`（另有若干 `DEBUG_Run*` 调试开关持久化 key，见上文调试开关，键名存档于私有仓）。

## 日志/埋点体系

- 双通道批量上报：`POST {logApi}/log/app`（REQUEST/SCAN/PAY/BLE/TRACE/EVENT/DEVICE_INFO 等技术日志）与 `/log/event`（startApp/startEbike/scanEbike 等行为埋点），2 秒定时批量，无签名，失败退避。
- 日志公共字段：platform、tenantId、version(5.23.0)、sessionId、deviceId、networkType、systemInfo、userInfo(phone/authName 打码)、openId、traceId、elapsedTime、page。
- `traceId` 双体系：请求级 traceId（时间戳+随机数，进 body）与场景级 trace（开锁/还车/启动全链路埋点串联）。
- 命中关键字的失败响应强制全量上报（告警配置）。

## 未决问题

1. **`pagesSub3`/`pagesSub4` 页面实现**：无对应 wxapkg（目录下仅 `.json` 配置）——互动弹窗 interactivePopup、评价提交 review/submit、信用分页 creditScore、骑行任务规则 rideTaskRule、校园一卡通绑定 oneCardBind、公交换乘 busDiscountHome、拍照 AI takePhotoAi（pagesSub3），年度报告 ridingReport/annualRidingReport2024、抽奖 luckyLot/lotteryActivity（pagesSub4）的页面交互细节无法证实（接口定义本身在 `common/vendor.js` 中完整）。
2. **服务商平台 appId/appKey**（ext 顶层，值已脱敏）：全部已还原代码中未检索到使用点，用途不确定（疑为小安服务商平台的推送/短信/人脸服务商凭据，或供 `pagesSub3`/`pagesSub4` 使用）。
3. **`payBaseApi: https://pay.xiaoantech.com`**：ext 中声明，但全部已还原 JS 未见直接请求（支付均走业务网关 `/ebike_pay/*`），可能供 `pagesSub3`/`pagesSub4` 或 H5 收银台使用，或为历史遗留。
4. **`code-btn`「知音指令」组件**（见[支付流程](./flows/payment.md)）：`pagesSub2/pay/pay.wxml` 引用但 `app-config.json` usingComponents 未注册该组件，微信端渲染预期失败；其来源插件/多端复用背景无法从本包证实。
5. **同盾 blackbox 内部算法**：在 `tdfp-plugin` 微信插件内（不在包内），无法分析；客户端仅透传 `deviceToken`。
6. **预约计费接口**：函数存在但 URL 常量缺失，为死代码，未计入接口总数。
7. **接口计数口径**：总数 344 为「已解析 URL」计数；分包页面未引入任何新端点（无硬编码 URL，全部经 vendor API 模块）。同一 URL 被多模块封装的按主要模块计一次，去除跨模块重复路径后唯一业务路径约 339 个（另含 1 个第三方完整 URL）。
