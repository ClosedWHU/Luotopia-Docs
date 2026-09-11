---
title: 其他发现
sidebar_label: 其他发现
description: 调试开关、硬编码业务常量、企业微信插件、第三方 SDK、隐私合规观察与实现层面可疑点。
sidebar_position: 7
---

## 调试开关

| 位置 | 内容 | 影响 |
|---|---|---|
| `app.json` | `"debug": true` | **发布包里开着调试**。真机 vConsole 可用 |
| `project.private.config.json` | `"setting": { "es6": false, "urlCheck": false }` | 关闭 ES6 转 ES5、**关闭域名白名单校验**（开发者工具配置，随包泄露） |
| 插件段 `config/app.config.js` | `debug: !1` | 企业微信插件调试关（非业务） |
| 插件段 `lib/conn/conn.js` | `enableConsole(bool)`，默认开启 | 插件日志默认开启 |
| `utils/util.js` | `joker` 解密分支里 `console.log` | **明文 URL + 解密后完整响应体进 console**（见[报文加密](./crypto.md#响应体解密joker)） |
| 全站 | `console.log` 大量保留：登录响应、token 获取、自动重登、扫码、客服、车辆状态、计价提示等 | 配合 `debug:true` 可实时观察 token、openid、订单、计价、运营区配置 |
| `pages/index/index.js` | 首页门禁函数中把押金状态硬写为已缴 | **客户端押金门禁被本地状态短路**（弱点类别：客户端校验形同虚设；见[押金与免押路径](./flows/payment-deposit.md#押金与免押路径)） |
| `orderComponents/comment/comment.js` | `orderId: this.data.orderId || "12345678"` | 评价接口的测试兜底 ID 残留 |

## 硬编码业务 ID / 常量

- 运营区 ID 白名单（`pages/index/index.js` `checkCityPermissions`、`pages/loginPre/loginPre.js`）：
  - 关闭首单免费的 8 个区：`1905231014892`(南宁交投)、`1802061057849`、`1908161356897`(张家界，另触发「配合创文，张家界暂停营运」弹窗)、`1810171152871`、`1912211149908`、`2001061148911`、`1811231438878`、`1812041206880`
  - `1803131728852` → `isDongxihu`（武汉东西湖）
  - `1703110248001`、`1703152031003` → `isWuHan`
  - `<武汉大学区域 ID>` → 武汉大学（触发信息授权协议 + 骑行规则视频 + 客服 FAQ 增项 + 武大游客押金接口，端点细节存档于私有仓）
  - `<武汉大学区域 ID（疑似另一校区）>` → `pages/readyUnlock/readyUnlock.js` `onStart` 里有一个空判断（比较后无分支体，疑为残留）
- licenseId：`5a13efac…`（武大信息对外提供授权）、`a9abdf31…`（骑行规则视频已看标记）
- 工单列表页默认 ID：`ffffffffffffffffffffffff`（占位）
- 临时锁车超时参数与头盔盒查询/开锁指令码为硬编码常量（值存档于私有仓 `whu-ebike-re`）
- `channel: "miniMango"`（所有支付请求）；`source: "miniMango"`（异常回捞）；`endpoint: "mini"` / `plat: "miniMango"`（`mg-dvi`）
- 客服渠道号 `<已脱敏：IM channel-no>`；geovisearth token `<已脱敏：第三方地图 token，32 位十六进制>`
- 客服电话 `4000238906`、`02039715531`
- **首页导航输入框的默认值是武汉的开发测试地址**：`pages/index/index.js` 的 `data` 里 `inputValue: "关山大道369-8号"`、`inputValue2: "洪山区新玉路"`。这两个值就是路径规划请求的起点/终点默认输入——提交时只校验终点非空，起点为空才回落到当前定位，因此**用户不改起点直接点搜索，会把武汉洪山区的地址当起点发到服务端**。属未清理的开发残留，也说明该功能主要在武汉联调。
- 兜底金额：押金 `29900`(299元)、免押卡 `990`(9.9元)/原价 `59990`/`7`天、充值档位 `500/1000/2000/5000` 赠 `100/200/400/1000`

## 插件（企业微信）

| provider appid | 名称/版本 | 判定 | 依据 |
|---|---|---|---|
| `wx104a1a20c3f81ec2` | `contactPlugin` v1.4.3 | **腾讯企业微信「联系我」/客服名片插件**。渲染企业成员头像+昵称+「联系我/立即联系/咨询服务/在线咨询/联系客服」按钮，可生成海报二维码 | 插件段 `components/cell/cell.js`（多种展示样式、配置查询、成员信息换取、`wxml-to-canvas` 海报）；iOS/Android 微信版本门槛，企业微信环境直接放行 |
| `wx4d2deeab3aed6e5a` | `materialPlugin` v1.0.5 | **企业微信「群聊/素材」插件**（客户群活码卡片） | 插件段 `components/groupCell/groupCell.js`（活码 URL 校验、群聊素材资源、群海报生成） |

两个插件的 `package.json` / `package-lock.json` 被原样打进了包里（`app-service.js` 中的 `global.__wxAppCode__['plugin-private://.../package.json']`），可直接读到内部信息：

```jsonc
// plugin-private://wx104a1a20c3f81ec2/package.json
{ "name": "contact-plugin-miniprogram", "version": "1.0.0", "private": true,
  "dependencies": { "widget-ui": "^1.0.2" } }

// plugin-private://wx4d2deeab3aed6e5a/package.json
{ "name": "chatgroup-plugin-miniprogram", "version": "1.0.0", "main": "index.js",
  "dependencies": { "widget-ui": "^1.0.2", "@tencent/wwui-wxml2canvas": "^0.0.6" } }

// plugin-private://wx4d2deeab3aed6e5a/package-lock.json（节选）
{ "lockfileVersion": 1,
  "dependencies": {
    "@tencent/ww-miniprogram-lib": { "version": "2.5.15",
      "resolved": "<第三方内网 registry>/@tencent/ww-miniprogram-lib/-/…-2.5.15.tgz" },
    "eventemitter3": { "version": "4.0.7", "resolved": "<第三方内网 registry>/…" },
    "widget-ui":     { "version": "1.0.2", "resolved": "<第三方内网 registry>/…",
                       "requires": { "eventemitter3": "^4.0.0" } } } }
```

即：`contactPlugin` = **contact-plugin-miniprogram**（企业微信「联系我」成员名片/客服），`materialPlugin` = **chatgroup-plugin-miniprogram**（企业微信客户群活码/群海报）。`miniprogram_npm/widget-ui`、`miniprogram_npm/eventemitter3`、`miniprogram_npm/@tencent/wwui-wxml2canvas` 都是这两个插件的依赖，不是业务代码。`package-lock.json` 里的 `resolved` 指向 `<第三方内网 registry>`（HTTP 明文 + 内网域名），`integrity` 为 sha512 base64。

两个插件共享同一套企业微信基础设施，被解包工具摊平到根目录：`config/app.config.js`（api 前缀、`app_type: 4`、`max_try: 3`）、`lib/request/request.js`、`lib/storage/storage.js`、`lib/conn/conn.js`、`lib/notify/index.js`（插件内观察者，非网络通知）、`lib/util/index.js`（`compareVersion` + 埋点）、`api/data.js` + `index.js`（内存变量模块）。

插件自有会话机制（与业务 JWT 完全独立）：`wx.login()` → 企业微信登录端点（form 提交，带 cookie）→ 会话四元组存入 `WEWORK_STORAGE_CACHE.session`；后续请求把会话字段**合并进 data**（不是 header），错误码指示失效时自动重登（最多 `max_try=3` 次，带请求排队与并发锁）。

小程序侧只在客服类型为 `qywx` 的运营区启用：按运营区取微信客服账号 ID 填入 `<cell>` 插件组件；会话结束回调触发使用计数。非 `qywx` 区域走 WebView 打开承满点 IM（URL 上带 `phone` 与 `region`，见[隐私与合规观察](#隐私与合规观察)）。

## 第三方 SDK / npm

| 包 | 版本 | 用途 | 位置 |
|---|---|---|---|
| `eventemitter3` | 4.0.7 | **企业微信插件的依赖**（`widget-ui` 的 `requires`），业务代码未使用 | `miniprogram_npm/eventemitter3/index.js` |
| `widget-ui` | 1.0.2 | 腾讯 WXML→Canvas 布局引擎，被 `wxml-to-canvas/widget.js` 继承用于生成分享海报 | `miniprogram_npm/widget-ui/index.js` |
| `@tencent/ww-miniprogram-lib` | 2.5.15 | 企业微信基础库，仅出现在 `package-lock.json`（代码已内联进插件段） | 原始包 `app-service.js` 插件段的 `package-lock.json` |
| `@tencent/wwui-wxml2canvas` | ^0.0.6 | 企业微信 UI 版 WXML→Canvas | `miniprogram_npm/@tencent/wwui-wxml2canvas/*` |
| `wxml-to-canvas` | — | 同上的社区版副本 | `components/wxml-to-canvas/*` |
| CryptoJS | 3.x 风格 UMD | 仅用 HmacSHA256 + AES-CBC/PKCS7 + Base64/Hex/Utf8 | `utils/crypto-js.js`（约 48KB，含大量未用算法） |
| AMapWX（高德小程序 SDK） | 1.30 | **未被实例化、无 key** → 死代码 | `libs/amap-wx.130.js` |
| `@babel/runtime` | — | `regeneratorRuntime`、`asyncToGenerator` 等 30+ helper | `@babel/runtime/*` |
| 自研 | — | `utils/EventEmitter.js`（另一套事件实现，`globalData.event` 用的是它）、`utils/GEOHelper.js`（地理计算）、`packages/business/utils/GEO/coordTransform.js`（WGS84/GCJ02/BD09 互转）、`packages/business/utils/workOrderEnum.js`（工单/损坏部位/乱停类型等枚举） | — |

`app.json` 里没有 `plugins` 字段（在 `app-config.json` 里），也没有 `sitemapLocation`；`componentFramework: exparser`、`renderer: webview`（非 skyline）。

## 隐私与合规观察

1. **`session_key` 下发客户端并落盘**（静默登录返回 + `wx.setStorageSync("sessionKey")`），并在手机号一键登录解密请求中回传给服务端。session_key 本应仅存服务端（见[认证与会话](./auth.md)）。
2. **实名认证失败时，姓名 + 完整身份证号被二次上报**到前端异常回捞端点的 `frontData`（`pages/auth/auth.js`），失败凭证二次落库。
3. **JWT 出现在 WebView URL query**（会员中心、押金购卡活动 H5），会进入 H5 历史/Referer/日志。
4. **手机号通过 `wx.reportEvent("phone_login", …)` 上报微信自定义分析**（`pages/login/login.js`），逆序 + `_` 分隔只是弱变形。
5. **手机号明文拼进客服 IM URL**（且 `region` 参数拼接缺少 `=`），第三方域名 `mg.im.chengmandian.com.cn` 可直接读到。
6. **邀请二维码走 HTTP 明文第三方服务，且把含 shareId 的业务链接交给第三方**（见[第三方服务](./overview.md#第三方服务)）。
7. `mg-dvi` 每请求携带精确 GCJ02 经纬度、电量、设备型号、系统版本、屏幕尺寸、字号设置、区域 ID；key/IV 硬编码固定 → 等同明文设备指纹（见[报文加密](./crypto.md#设备信息-mg-dviaes-上行加密)）。
8. `requiredBackgroundModes: ["location"]` + `scope.startLocationUpdateBackground` + `onLocationChange` 常驻，后台持续定位；同时 10s/30s 轮询未在 `onHide`/`onUnload` 清理。
9. `app.json` 的 `permission.scope.*` 描述文案与实际用途一致（周边车辆、路线规划、停车区获取），无明显超范围声明。

## 实现层面的可疑点 / BUG

| 位置 | 问题 |
|---|---|
| `utils/util.js` 签名逻辑 | 系统信息异步采集但同步使用 → `mg-dvi` 内容不稳定（见[报文加密](./crypto.md#设备信息-mg-dviaes-上行加密)） |
| `utils/util.js` 签名逻辑 | 值串构造存在计算后即丢弃的死代码 |
| `utils/util.js` 签名逻辑 | 对 falsy 值的编码处理有缺陷，可致不同取值产生相同签名（细节存档于私有仓） |
| `utils/util.js` `uploadFile` | 忽略调用方的 `name`，表单字段恒为 `file`；content-type 拼写错误且无效 |
| `utils/util.js` `uploadFile` | 上传请求不带任何 `mg-*` 签名头（见[未签名的上传通道](./signing.md#未签名的上传通道)） |
| `pages/index/index.js` `getLocation` | 城市权限/运营区数据调用用位置参数传经纬度，函数体内再重排，可读性差、极易在后续维护中搞反经纬度顺序 |
| `utils/util.js` | 6 组 URL 表 key 各自指向同一路径（库存/钱包/订单/工单/登录/二维码），维护成本高 |
| `pages/index/index.js` | 首页门禁函数把押金状态硬写为已缴，短路押金门禁（见[押金与免押路径](./flows/payment-deposit.md#押金与免押路径)） |
| `pages/index/index.js` | `onShow` 里为拿客服 ID 开了个**永不清理的 1s `setInterval`**（靠闭包变量停发请求，但定时器本身不 clear） |
| `pages/index/index.js` | `onLoad` 里 3 个 `setInterval`（30s 预约、2s 线要素、1s 扫码态）与 10s 订单轮询，`onUnload` 只清了救援定时器 |
| `utils/util.js` `dataRequest` | `other` 参数被空表达式消费，`silent` 永不生效，调用方的「静默失败」预期落空（见[dataRequest 调用契约](./signing.md#datarequest-调用契约)） |
| `pages/index/index.js` | 预约车辆连线绘制是空实现，功能未接 |
| `pages/index/index.js` | 双刹提示/公告/marker 点击/头盔检测关闭及登录页两处回调均为空函数 |
| `pages/index/index.js` | 导航输入框默认值硬编码为武汉测试地址，未清理即上线（见[硬编码业务 ID / 常量](#硬编码业务-id--常量)） |
| `pages/inviteFriend/inviteFriend.js` | 二维码生成调用未传 method、无 callback（无效调用） |
| `orderComponents/comment/comment.js` | `orderId || "12345678"` 测试兜底 |
| `pages/readyUnlock/readyUnlock.js` | 与 `<武汉大学区域 ID（疑似另一校区）>` 的比较为逗号表达式，判断结果被丢弃 |
| `pages/index/index.js` | 大量中文文案在源文件中以 `\uXXXX` 转义与直接 UTF-8 混存（解包产物特征），grep 时需注意编码 |
| 服务端路径拼写 | `serachForPath`(search)、`vaildCanUse`(valid)、`plakingLot*`(parking)、`bugCommutingCard`(buy) —— 客户端只能照抄 |

复现请求的最小要素与签名构造细节已移入私有仓 `whu-ebike-re`（另见[请求签名](./signing.md)的机制概述与弱点评估）。
