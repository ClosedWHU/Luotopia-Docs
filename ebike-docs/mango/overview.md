---
title: 概述与 API 主机环境
sidebar_label: 概述与主机
description: 芒果电单车小程序目录结构的真实含义、业务代码分层，以及业务 API、CDN 与第三方主机清单。
sidebar_position: 1
---

> 完整未脱敏版存档于内部仓库 whu-ebike-re。

- 小程序：芒果电单车（appid `wxbd322b1a1127faee`，南宁交投运营，mangoebike.com）
- 分析对象：`mango-ebike/`（unveilr 还原的 wxapkg 源码，原生小程序构建，压缩单行 JS）
- 本文所有路径均相对 `mango-ebike/`；行号针对**美化后**的等价代码（原文件为单行压缩，行号仅作定位参考，正文引用时会同时给出可 grep 的符号名）
- 分析范围：仅静态阅读，未修改源码、未发起任何真实请求

## 1. 概述

### 1.1 目录结构的真实含义（重要）

根目录下的 `config/`、`lib/`、`api/`、`index.js`、`components/cell`、`components/groupCell`、`components/wxml-to-canvas`、`miniprogram_npm/*` **不是业务代码**，而是两个腾讯企业微信插件被解包工具摊平到根目录后的产物。证据：

- 原始包 `app-service.js`（编译合并 bundle，不收录于仓库）前 ~6420 行是 `plugin-private://wx104a1a20c3f81ec2` 与 `plugin-private://wx4d2deeab3aed6e5a` 的模块定义（其中 `define("config/app.config.js")`、`define("lib/request/request.js")`、`define("components/cell/cell.js")`、`define("components/groupCell/groupCell.js")` 各出现两次，分别属于两个插件）。
- `app-config.json` 的 `plugins` 字段：
  ```json
  "plugins": {
    "contactPlugin":  { "version": "1.4.3", "provider": "wx104a1a20c3f81ec2", "subpackage": "__APP__" },
    "materialPlugin": { "version": "1.0.5", "provider": "wx4d2deeab3aed6e5a", "subpackage": "__APP__" }
  }
  ```
  两个插件的真实包名是 `contact-plugin-miniprogram`（企业微信「联系我」名片/客服）与 `chatgroup-plugin-miniprogram`（企业微信客户群活码），详见[其他发现](./findings.md) §9.3。
- 插件组件在页面 WXML 中以 `<cell>` / `<cell2>` 使用，`pages/account/account.json`、`pages/index/index.json` 声明 `plugin://wx104a1a20c3f81ec2/cell`、`plugin://wx4d2deeab3aed6e5a/cell`。

因此 **`config/app.config.js` 里的 `https://work.weixin.qq.com/cgi-bin/mng/` 是插件自己的后端，与芒果业务无关**。业务 API 全部集中在 `utils/util.js`。

### 1.2 业务代码分层

| 层 | 文件 | 职责 |
|---|---|---|
| URL 表 | `utils/util.js`（对象 `c`，100 个 key） | 全部后端接口路径，函数型 key 负责拼接路径参数 |
| 请求封装 | `utils/util.js` → `dataRequest` / `uploadFile` | 唯一的业务请求出口，负责组装 header（含签名） |
| 签名/加密 | `utils/util.js` → 函数 `s(method, url, query, body)` | 生成 `mg-sig` / `mg-ts` / `mg-sk` / `mg-eyt` / `mg-dvi` |
| 加密库 | `utils/crypto-js.js`（CryptoJS UMD，约 48KB） | 实际只用到 `HmacSHA256`、`AES-CBC/PkCS7`、`enc.Base64/Hex/Utf8` |
| 登录态 | `utils/features/user.js` | `checkOpenIdAndSession` / `userLoginByOpenId` / `userLoginByOpenIdOnHasId` / `clearUserLoginCache` / `checkRealNameAuthentication` |
| 全局态 | `app.js`（`globalData`） | token、openid、sessionKey、userId、regionId、location、押金/余额等 |
| 埋点 | `utils/monitor/systemMonitor.js` | 自建批量埋点上报 |
| 卡券聚合 | `utils/promoRideCard.js` | 骑行卡/通勤卡/免押套餐统一拉取与支付 |
| 静态配置 | `utils/dataBase.js` | WebView 文档 URL 表、押金状态枚举 |
| 定位封装 | `utils/encapsulation/WXFeature.js` | `getSystemLocation`、后台定位监听 |

`lib/conn/conn.js` **不是长连接层**，详见[车辆状态通道](./flows/unlock-return.md)。

## 2. API 主机与环境

### 2.1 业务 API

| 主机 | 用途 | 来源 |
|---|---|---|
| `https://api.mangoebike.com` | **唯一业务后端**。前缀 `/miniMango/v1/*`；文件上传走 `/oss/*` | `utils/util.js` 变量 `r = "https://api.mangoebike.com"` |

未发现任何测试/预发/灰度环境开关：`r` 是硬编码常量，没有按 `regionId`、`scene`、`globalData` 或 storage 切换 baseURL 的逻辑，也没有 `wx.getAccountInfoSync().miniProgram.envVersion` 分支。**单环境、单域名。**

### 2.2 CDN / 静态资源

| 主机 | 用途 | 来源 |
|---|---|---|
| `https://mangoebike.oss-cn-shenzhen.aliyuncs.com` | 小程序图片资源（`/mini/images/*`、`/image/instructions/*`），分享图、按钮图、说明图 | 全站 WXML/JS，约 60+ 处 |
| `https://mg-config.oss-cn-shenzhen.aliyuncs.com` | 用户协议、武汉大学免责条款 HTML | `utils/dataBase.js` `webUrl["用户协议"]` / `webUrl["武汉大学免责条款"]` |
| `https://mangoebike.com` | H5 页面：`/mobile-app-share/index.html`（分享落地）、`/mobile-vip/index.html`（会员中心）、`/helper/ebike-faq.html`（客服 FAQ）、`/download.html`、`/activePage/200928/index.html`（押金购卡活动）、`/assets/videos/preview/cyclingRules/*`（骑行规则视频 m3u8/mp4） | `utils/dataBase.js`、`pages/index/index.js`、`pages/customerService/customerService.js`、`pages/previewVideo/previewVideo.js` |
| `https://www.mangoebike.com` | `/cityPartner/index.html#/attract` 城市合伙人招商 | `pages/index/index.js` `toPartner`、`pages/account/account.js` |
| `https://blog.mangoebike.com` | 帮助/协议文档（计价规则、押金说明、退款说明、信用分说明、免押说明、包车说明等 30+ 篇，2017–2019 年 WordPress 文章） | `utils/dataBase.js` `webUrl` |

### 2.3 第三方服务

| 主机 | 用途 | 认证方式 | 来源 |
|---|---|---|---|
| `https://api.open.geovisearth.com` | 中科星图（geovisearth）逆地理 `/pj/geo/v2/poi/circle` 与关键字联想 `/pj/geo/v2/assistant/suggestion`，用于「停车区推荐」页选址 | **硬编码 token 明文放在 query**：`token: "<已脱敏：第三方地图 token，32 位十六进制>"` | `packages/business/pages/recommendedParkingLot/recommendedParkingLot.js`（`searchAddressByLocation` / `searchAddressByKeyword`） |
| `https://restapi.amap.com` | 高德 Web 服务（`/v3/geocode/*`、`/v3/place/around`、`/v3/direction/*`、`/v3/weather/weatherInfo`、`/v3/staticmap`、`/v3/assistant/inputtips`、`/rest/me`） | 需要 key | `libs/amap-wx.130.js`（`AMapWX` SDK）。**全仓库无 `new AMapWX(...)` 调用、无高德 key** → 判定为未启用的死代码 |
| `http://qr.topscan.com/api.php` | 邀请页生成二维码图片（`?text=<分享链接>`） | 无 | `pages/inviteFriend/inviteFriend.js` `fetchShareInfo`（`QRCode` 字段）。**注意是 HTTP 明文，且把带 shareId 的链接发给第三方** |
| `https://mg.im.chengmandian.com.cn` | 在线客服 IM（`/ccs/user/mobile/login?channel-no=<已脱敏：IM channel-no>`），以 WebView 打开，URL 上追加 `&phone=<用户手机号>&region<regionId>` | channel-no 硬编码 | `utils/dataBase.js` `webUrl["联系客服"]`；`pages/index/index.js` `serviceEntrance`、`pages/auth/auth.js` `textTapHandler`、`pages/customerService/customerService.js` `onGotoCustomerService` |
| `https://api.mch.weixin.qq.com` | `/pay/unifiedorder` 微信支付统一下单 | — | `utils/util.js` key `payfor`。**仅定义，客户端从未调用**（下单在服务端完成，见[支付与押金流程](./flows/payment-deposit.md)） |
| `https://api.weixin.qq.com` | `/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET` | 占位符 `APPID`/`APPSECRET` 未替换 | `utils/util.js` key `access_token`。**仅定义，从未调用**（残留） |
| `https://work.weixin.qq.com` | 企业微信插件后端：`/cgi-bin/mng/`（`api_prefix`）、`/cgi-bin/mng/xcx/login`、`/cgi-bin/mng/contactplugin/queryconfig`、埋点 `/wework_admin/report` | 插件自有 `skey`/`vid`/cookie 会话 | `config/app.config.js`、`lib/request/request.js`、`lib/util/index.js`、`components/cell/cell.js`、`components/groupCell/groupCell.js` |
| `https://wwcdn.weixin.qq.com` | 企业微信插件默认头像等静态图 | — | `components/cell/cell.js`、`components/groupCell/groupCell.js` |
| `http://r.tnpm.oa.com` | 腾讯内网 npm registry，仅出现在 `miniprogram_npm/widget-ui/index.js`、`miniprogram_npm/eventemitter3/index.js` 的包元数据里（`_resolved`） | — | 泄露了内部构建来源，无功能影响 |

### 2.4 其他外部标识

- `app.json` → `navigateToMiniProgramAppIdList: ["wxebadf544ddae62cb"]`（允许跳转的另一个小程序）。
- 客服电话硬编码：`4000238906`（`pages/refund/refund.js`、`pages/findLostTraction/findLostTraction.js`）、`02039715531`（`pages/index/index.js` `toCall`、`pages/customerService/customerService.js`）。
