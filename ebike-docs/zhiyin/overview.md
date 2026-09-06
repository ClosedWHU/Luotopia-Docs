---
title: 概述与 API 主机环境
sidebar_label: 概述与主机
description: 知音出行小程序的白标租户背景、ext 租户参数、生产网关与容灾域名池机制概述、CDN 与第三方主机清单。
sidebar_position: 1
---

> [!NOTE]
> 完整未脱敏版存档于内部仓库 whu-ebike-re。

## 概述

- 「知音出行」是湖北知音动漫有限公司运营的共享电单车小程序，但它是**小安科技（xiaoantech）共享两轮车 SaaS 的白标（OEM）租户端**：代码内部名称为「电驴出行」，所有后端域名、静态资源、配置体系均属 `xiaoantech.com`。租户身份通过微信第三方平台的 `ext.json`（运行时 `wx.getExtConfigSync()`）注入，本包的 ext 配置完整保留在 **`app-config.json` 的 `"ext"` 字段**中。
- 关键租户参数（`app-config.json` → ext）：
  - `name: "知音出行"`，`alias: "zhiyin"`
  - `platformTenantId: "1534"`，`platformSecret: "<已脱敏：platformSecret>"`
  - `platformSign: "<已脱敏：platformSign，64 位十六进制>"`（请求签名盐）
  - `api.baseUrl: "https://ebike-client-prod2.xiaoantech.com"`（业务 API，PROD2 环境）
  - `api.logApi: "https://log-api.xiaoantech.com"`（日志上报）
  - `qrDomain: "https://ebike-zhiyin.xiaoantech.com"`（车辆二维码域名）
  - `platform.mp-weixin.appid: "wx8df7475fde0271c6"`；`pay.channelType: "BAOFU_WXLITE"`（宝付支付通道）；`pay.payBaseApi: "https://pay.xiaoantech.com"`
  - `faceCheckType: "chuangLan"`（创蓝人脸核身）
- 客户端版本号 `version: "5.23.0"`，随每个请求 body 上报。
- **代码完整度**：主包页面（`pages/map`、`pages/launch`、`pages/webview` 等）、`components/`、`common/`（vendor/main/runtime）、分包 `pagesSub`（79 页，含 precycling/riding 确认页、charge、order、repair、发票、identityAuth 等）与 `pagesSub2`（24 页，含 quickLogin/phoneLogin/smsVerification、riding、pay、paymentResult、verified 等）为完整代码。`pagesSub3`（7 页：interactivePopup、review/submit、creditScore、rideTask、oneCardBind、busDiscountHome、takePhotoAi）与 `pagesSub4`（7 页：ridingReport、luckyLot、annualRidingReport2024、lotteryActivity×3）无对应 wxapkg，仅存 `.json` 页面配置，涉及条目见[未决问题](./findings.md)。分包页面 JS 中**无任何硬编码接口 URL**（全部经 vendor API 定义模块调用）。
- 业务 API 总数：**344 个已解析接口**（另含 3 个未走业务网关的独立端点：域名池配置拉取、日志 `/log/app`、`/log/event`），全部为 POST + JSON。未发现任何 WebSocket（`wss://`）地址，`connectSocket` 仅出现在超时配置中（`app-config.json` networkTimeout）。接口级清单存档于私有仓 `whu-ebike-re`，公开侧见[接口能力类别](./api/auth-user.md)各页。

## API 主机与环境

### 业务 API（小安 SaaS 网关）

当前生效环境为 **PROD2**：`https://ebike-client-prod2.xiaoantech.com`（来源：`app-config.json` ext.api.baseUrl）。

代码内置了完整的多环境切换表（DEV/TEST/UAT/灰度/其他云等，各环境有独立网关、灰度网关与**各自的签名盐**，调试用）。非生产环境拓扑清单已移入私有仓 `whu-ebike-re`（弱点：测试环境同样缺乏签名防护，且各环境签名盐均随客户端包分发，见[请求签名](./signing.md)）。

另有内置域名池（容灾多活）：生产组含多个镜像域名与备用顶级域，请求层在 5xx/特定错误码时剔除当前域名并重新拉池（默认重试 3 次、重试窗口 60s），App 前台恢复与网络状态变化时刷新。域名清单与池机制实现细节存档于私有仓 `whu-ebike-re`。

### 日志/埋点主机

- 生产日志主机 `https://log-api.xiaoantech.com`。端点：`POST /log/app`（技术日志）、`POST /log/event`（行为埋点），批量直发 `uni.request`，**不走签名请求层**（弱点类别：日志通道无签名防护）。测试环境日志主机清单已移入私有仓。

### CDN / 静态资源

| 域名 | 用途 | 来源 |
|---|---|---|
| `https://xiaoan-fe.xiaoantech.com` | 前端静态资源（图片/视频/音频），全项目 2400+ 处引用 | `app-config.json` ext.customSetting、vendor 默认配置 |
| `https://xiaoan-fe.oss-cn-shenzhen.aliyuncs.com` | 资源 OSS 源站（导航广告图等） | ext.customDiy.navigationAdConfig |
| `https://saas-frontend-test.oss-cn-shenzhen.aliyuncs.com` | 测试 OSS（logo 兜底等） | vendor 默认配置 |
| `https://ebike-saas.xiaoantech.com` | SaaS 托管的协议/帮助 H5 页（webview 打开） | vendor 默认配置 documentCfg |
| `https://ebike-zhiyin.xiaoantech.com` | 知音车辆二维码域名（扫码 URL 校验） | ext.qrDomain |
| `https://fuwushang.xiaoantech.com` | 「小安科技服务商」默认配置的二维码域名（兜底，不生效） | vendor 默认配置 |
| `https://cdn1.dcloud.net.cn`、`https://uniapp.dcloud.net.cn` | uni-app 框架资源 | vendor（uni 运行时） |
| `https://pay.xiaoantech.com` | ext 中的 `payBaseApi`（支付基座地址；本包 JS 中未见直接调用，支付实际走业务网关 `/ebike_pay/*`） | ext.platform.mp-weixin.pay |
| `https://ebike-dianlv-test2.xiaoantech.com` | AI 客服 H5 | ext.aiCustomerService |

### 第三方主机

| 域名/AppID | 归属 | 用途 | 来源 |
|---|---|---|---|
| `https://wxgo.adwke.com/api/miniapp/wechat` | adwke「广宣」广告 | 第三方广告配置拉取（无签名） | vendor 广告模块 |
| `https://ad.jujufun.net` | juju 广告 | 广告投放/事件上报（**独立签名**，见[请求签名](./signing.md)） | vendor 广告模块 |
| `https://ad.helpmepick.net/api/advert/ack` | coral 广告 | 广告拉取/回执（无签名） | vendor 广告模块、`components/x-ad/x-ad.js` |
| `https://api.bspapp.com` | 阿里云 uniCloud | uni-app 运行时内置 endpoint（未见业务调用） | vendor（uni 运行时） |
| `http://baoxian.pingan.com/pa18shopnst/orderSearch/wxDetail.shtml?pNo=…&vNo=…` | 平安保险 | 骑行险保单查询链接（复制到剪贴板），团体保单号硬编码（已脱敏，见[其他发现](./findings.md)） | `components/insuranceDetailModal/insuranceDetailModal.js` |
| `https://ida.webank.com/api/web/login` | 微众银行 | H5 人脸核身（`faceCheckType:"h5"` 分支）：服务端返回核身参数后拼 URL webview 打开，sign 由服务端计算 | `pagesSub/identityAuth/faceScan.js` |
| `https://ebike-dianlv.xiaoantech.com/` | 小安科技（电驴出行） | AI 客服 H5 生产域名，**仅 `tenantId∈{1,2,5}` 时硬编码启用**；知音走 ext.aiCustomerService.entranceUrl，兜底 `ebike-saas.xiaoantech.com` | `pagesSub/customerService/customerService.js`、`pagesSub/help/help.js` |
| `https://mp.weixin.qq.com/wxawap/waprivacyinfo?action=show&appid=wx5f93a0e898d0c178` | 微信官方 | 支付页「微信隐私授权信息」webview 链接（appid 为微信官方公共账号参数，非本小程序） | `pagesSub2/pay/pay.js` |
| 小程序 `wxd8f3793ea3b935b8` | 微信支付分 | `wx.navigateToMiniProgram` 开启支付分授权（页面调用方：`pagesSub/wxPayScore/wxPayScore.js`） | vendor 支付分模块 |
| 小程序 `wx3cbe919f36710d1c` | 云闪付（天满通道） | 免密支付跳转/回跳识别 | vendor 支付模块 |
| 小程序 `wx80ee2c1b322f6f91` | 小安系扫码小程序 | 启动场景 1037 来源识别（extraData.qrCode 直跳开锁） | `pages/launch/launch.js` |
| 插件 `tdfp-plugin` | 同盾科技 | 设备指纹（见[请求签名](./signing.md)） | vendor 指纹模块 |
| 插件 `fuiou-pay` | 富邦银行 | 插件支付通道（知音未启用，channel=BAOFU_WXLITE） | vendor 支付模块 |
| 腾讯位置服务 key `<已脱敏：腾讯位置服务 key>` | 腾讯地图 | 仅存在于 ext 的 **h5** sdkConfigs（小程序端未使用；逆地理编码走后端高德代理 `/client/management/gaode/*`） | `app-config.json` ext.platform.h5 |
| `wx4ae1319476636ffd` / 支付宝 `2021004138688327` | 小安自营小程序 | 内置默认（fuwushang）配置中的 appid，非知音 | vendor 默认配置 |
