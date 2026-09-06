---
title: 认证与会话
sidebar_label: 认证与会话
description: 凭据存储、三种登录方式、实名认证、会话失效自动重登、凭据携带方式与注销登出。
sidebar_position: 2
---

## 3. 认证与会话

### 3.1 凭据存储

业务侧**完全不使用** `lib/storage/storage.js`（那是企业微信插件的 `WEWORK_STORAGE_CACHE` 命名空间存储）。业务侧直接用 `wx.setStorageSync` / `getApp().globalData`：

| storage key | 内容 | 写入处 |
|---|---|---|
| `token` | 后端签发的 **JWT**（`response.jwt`），即 `Authorization: Bearer <jwt>` 的值 | `utils/features/user.js` `userLoginByOpenIdOnHasId`、`pages/login/login.js` `createToken`、`pages/enterCode/enterCode.js` `_loginButtonEvent`、`pages/index/index.js` `getOpenId` |
| `openid` | 微信小程序 openid（由**芒果后端**返回，不是本地解密得到） | `utils/features/user.js`、`app.js` `getOpenId`、`pages/index/index.js` `getOpenId` |
| `sessionKey` | 微信 `session_key`，**由后端下发到客户端并落盘** | 同上 |
| `doubleBraceNoPrompt` / `announceNoPrompt` / `rejectedOrdersPop` | UI 提示“不再提醒”标记 | `pages/index/index.js` |
| `WHShowDialogNotFirst` / `WHTourViewedRuleVideo` | 武汉大学信息授权协议、骑行规则视频已看标记 | `pages/index/index.js`、`pages/readyUnlock/readyUnlock.js`、`pages/previewVideo/previewVideo.js` |
| `sp_notice_<noticeId>` | 视频号直播预约状态 | `components/ShoppingAd/ShoppingAd.js` |
| `WEWORK_STORAGE_CACHE` / `WEWORK_NS_KEY` | 企业微信插件会话（`session` = `{gid, skey, vid, type, corpname}`、`freego.cookie`） | `lib/storage/storage.js`、`lib/request/request.js`（插件专用） |

`globalData`（`app.js`）中与会话/风控相关的字段：`token, openid, sessionKey, userId, tel, userTel, loginStatus, hasVerified, deposit, balance, mangoBalance, regionId, center, location, scene, isNanning, isWuHan, isDongxihu, operationPattern, parkingPattern, dispatchCost, outRegionDispatchCost, enableDispatchCost, enableWxPay, enableMangoBalance, enableRecharge, rechargeAmount, enableRegionDeposit, enableDepositRefund, enableFreeDepositAndCommuting, freeOrderTimeLimited, regionKfType, stockSearchRadius, hasUnpayOrder, hasUnPayAmount, isFreeDeposit, freeDepositWay, depositWay, scanCode`。

### 3.2 登录方式一：静默登录（openid → JWT）

启动即触发，用户无感。

```
app.js onLaunch
  └─ globalData.token = wx.getStorageSync("token")
  └─ globalData.scene  = wx.getLaunchOptionsSync().scene
  └─ setTimeout(() => checkOpenIdAndSession())          // utils/features/user.js

utils/features/user.js checkOpenIdAndSession()
  ├─ globalData.openid && globalData.sessionKey  → resolve(true)
  ├─ 否则读 storage openid / sessionKey          → 回填 globalData, resolve(true)
  └─ 否则 userLoginByOpenId(onlyCreateSession = true)
        └─ wx.login() → code
        └─ getOpenId({ res, getStorage:"token", onlyCreateSession:true })
              └─ GET  /miniMango/v1/account/user/openId?js_code=<code>
                    → { openid, session_key }
                    → setStorage("openid") / setStorage("sessionKey")
              └─ onlyCreateSession 为真 → 到此结束（不换 token）
```

真正换 token 的是 `userLoginByOpenIdOnHasId(openid, onlyCheck)`：

```js
// utils/features/user.js
function s(e) {                       // e = openid, 第二参 = onlyCheck
  ...
  (0, t.getSystemLocation)().then(function (t) {
    var u = t.longitude, l = t.latitude;
    if (!u || !l) return r(false);    // 拿不到定位就放弃登录
    n.default.dataRequest({
      url: "phoneCreateToken",        // POST /miniMango/v1/account/token
      method: "POST",
      bodyParam: { miniProgramsOpenId: e, center: [u, l] },
      callback: function (e) {
        var n = e.data;
        if ("success" === t && n.userInfo) {
          if (o) return r(true);      // onlyCheck：只探测账号是否已注册
          wx.setStorageSync("token", a.token = n.jwt);
          a.loginStatus  = true;
          a.userId       = n.userInfo.user._id;
          a.hasVerified  = n.userInfo.user.cert.hasVerified;
          a.deposit      = n.userInfo.wallet.deposit.paid;
          a.balance      = n.userInfo.wallet.balance;
          r(n);
        } else r(false);
      }
    });
  })
}
```

要点：
- `POST /miniMango/v1/account/token` 是**一个接口三种登录方式共用**（URL 表中 `phoneCreateToken` 与 `phoneWXCreateToken` 指向同一路径），靠 body 字段区分：只带 `miniProgramsOpenId` = 静默续登；带 `tel` = 微信手机号一键登录；带 `tel`+`code` = 短信验证码登录。
- 登录请求**必须带经纬度** `center:[lng, lat]`，定位失败则登录失败（业务上用于归属运营区）。
- 返回体是 `{ jwt, userInfo: { user: {_id, cert:{hasVerified}}, wallet: {deposit:{paid}, balance} } }`。

### 3.3 登录方式二：微信手机号一键登录

`pages/login/login.js` `getPhoneNumber(e)`（由 `<button open-type="getPhoneNumber">` 触发）：

```js
o = e.detail.encryptedData;  s = e.detail.iv;
c = { encryptedTel: o, iv: s, sessionKey: u.globalData.sessionKey };
l = { miniProgramsOpenId: u.globalData.openid };
a.default.dataRequest({ url: "getPhoneNumber", method: "PUT", bodyParam: c, callback: ... });
// → PUT /miniMango/v1/account/user/decryptTel  { encryptedTel, iv, sessionKey }
// ← { phoneNumber }
l.tel = n.phoneNumber;
wx.reportEvent("phone_login", { phone: (n.phoneNumber||"").split("").reverse().join("_") });  // 手机号逆序埋点
r.createToken(l);
// createToken: e.center = globalData.center || [0,0];
// POST /miniMango/v1/account/token { miniProgramsOpenId, tel, center } → { jwt, userInfo }
```

安全观察：**客户端把 `session_key` 明文发给后端**（后端其实自己有 session_key，这里属于冗余/设计遗留）；手机号通过 `wx.reportEvent` 上报到微信自定义分析（逆序拼接，弱去标识化）。

登录成功后：`hasVerified` 为假 → `wx.navigateTo("../auth/auth")` 强制实名；否则回首页。

### 3.4 登录方式三：短信验证码登录

```
pages/enterPhone/enterPhone.js  _sendCodeButtonEvent
  └─ POST /miniMango/v1/account/verify  { tel }              // key: sendCode
       → 成功后 globalData.tel = tel, navigateTo enterCode

pages/enterCode/enterCode.js
  ├─ confrimEvent（语音验证码）
  │    └─ POST /miniMango/v1/account/verify { tel, type: 1 }  // type=1 → 语音
  └─ _loginButtonEvent（4 位验证码，节流 1s）
       └─ POST /miniMango/v1/account/token
            { tel, code, miniProgramsOpenId, center }
            → { jwt, userInfo } → setStorage("token") → 实名判断 → index/auth
```

验证码为 **4 位数字**（`firstCode..fourthCode`），第 4 位输入完自动提交；页面有 60 秒倒计时限制重发。

### 3.5 实名认证 `pages/auth/auth.js`

```js
a.default.dataRequest({
  url: "auth",                        // POST /miniMango/v1/account/user/cert
  method: "POST",
  bodyParam: { certNo: this.data.idCard, certType: 0, name: this.data.name },
  callback: async function (n) {
    "success" === r && (globalData.hasVerified = true, wx.reLaunch({url:"../index/index"}));
    "fail" === r && a.default.dataRequest({
      url: "feedBack",                // POST /miniMango/v1/record/feedBack
      method: "POST",
      bodyParam: {
        source: "miniMango",
        path:   "/miniMango/v1/account/user/cert",
        frontData: { method: "POST", body: { certNo: idCard, certType: 0, name: name } }
      }
    });
  }
});
```

- `certType: 0` 固定（身份证）。姓名/身份证号以**明文 JSON body** 提交（依赖 HTTPS + `mg-*` 签名，body 本身不加密）。
- **认证失败时会把姓名 + 完整身份证号作为 `frontData` 再次上报到 `/record/feedBack`**（前端异常回捞），即失败凭证会二次落库，属于个人信息处理面扩大，值得在报告中单列。
- 实名门禁：`utils/features/user.js` `checkRealNameAuthentication(cb)` —— 若 `!hasVerified && loginStatus` 且当前页不是 `pages/auth/auth`，弹 `wx.showModal("账号未实名认证 / 请根据国家法规先完成实名认证后再扫码骑行！")`，确认后 `navigateTo ../auth/auth`；模块级 `o` 标志防止重复弹窗。扫码开锁链路（`pages/index/index.js` `scannerCheckoutAccount`、`pages/readyUnlock/readyUnlock.js` `_scanner` / `_enterNumber`）都会先调它。

### 3.6 登录校验页 `pages/loginPre/loginPre.js`

`app-config.json` 中该页标题为「登录校验中...」，但实际实现已退化为跳板：

```js
onLoad(e) {
  if (e.q) {                                     // 扫码进入，q = encodeURIComponent("xx=车牌号")
    var t = decodeURIComponent(e.q).split("=");
    if (t.length > 1) getApp().globalData.scanCode = t[1];   // 车牌号进全局
  }
},
onShow: async function () { wx.reLaunch({ url: "../index/index" }); }   // 直接重启到首页
```

页面里仍保留 `getStorgeToken()`（读 storage token）、`checkTokenVaild()`（`GET /account/user` 校验 401）、`getLocation()`、`checkCityPermissions()`（`GET /operation/city`）、`getRegionData()`（`GET /operation/region/intersect`）等方法，但 `onShow` 无条件 `reLaunch`，这些方法在本页不再被调用（同名逻辑被搬到了 `pages/index/index.js`）。`app.json` 的 `pages` 数组第 2 项就是它，说明历史上它是启动页；现在 `app-config.json` 的 `entryPagePath` 已是 `pages/index/index.html`。

`loginPre` 仍是**登出/注销后的落地页**：`pages/login/login.js` `logout()` / `destroy()` 都 `wx.redirectTo("/pages/loginPre/loginPre")`。

真正的“登录校验”发生在首页：
- `pages/index/index.js` `checkIndexStatus()`：按 `loginStatus → deposit → hasVerified → balance` 顺序决定顶部提示条 `topPrompt`（`type` 为 `login` / `hasVerified` / `deposit` / `dispatchCost`），`_tapButtonEvent` 据 type 跳 `login` 或 `auth`。
- `scannerCheckoutAccount()`：未登录弹「您还未登录 → 去登录」；`deposit === 0 && !isFreeDeposit` 跳 `deposit`；`hasUnpayOrder` 弹「您有调度费或租金未付」；通过后才 `navigateTo readyUnlock`。

### 3.7 会话失效与自动重登

`utils/util.js` `dataRequest` 的 `success` 分支：

```js
if (s.error) {
  if ((401 === l || 400 === l) && "getUserInfo" === o) {
    400 === l && wx.showToast({ title: s.error + "", icon: "none", duration: 2000 });
    if (d < 1 && wx.getStorageSync("token")) {          // d = 模块级计数，全流程只重试一次
      console.log("尝试自动登录中……");
      (0, i.clearUserLoginCache)();
      d++;
      (0, i.userLoginByOpenId)();                       // 重新 wx.login → openId → token
    }
  } else if (!("getCurrentOrder" === o && 401 === l) && "feedBack" !== o && 6 !== (s||{}).state) {
    if ("您还未登录" === s.error || 401 === l || s.suppressToast) { /* 静默 */ }
    else wx.showToast({ title: s.error + "", icon: "none", duration: 3000 });
  }
  setTimeout(() => u({ success:false, result:"fail", data:s.error, response:s }), 500);
  return;
}
u({ success:true, result:"success", data:s });
```

- 只有 `getUserInfo` 触发自动重登，且**整个进程生命周期只重试 1 次**（模块级 `d`，无重置）。
- `getCurrentOrder` + 401、`feedBack`、`state === 6`（车辆报失/牵引，走 `pages/findLostTraction`）会抑制错误 toast。
- 服务端可用 `suppressToast` 字段让前端闭嘴。
- 失败回调统一延迟 500ms；网络 `fail` 延迟 200ms 并 `wx.hideLoading()`。
- `clearUserLoginCache()` 会清 `loginStatus/userId/hasVerified/deposit/balance/token` 并 `wx.removeStorageSync("token")`，但**不清 `openid`/`sessionKey`**，所以重登只需一次 `wx.login`。

### 3.8 后续请求如何携带凭据

`dataRequest` 每次都调用 `s(method, url, data, bodyParam)` 现算 header，其中：

```js
Authorization: getApp().globalData.token && "Bearer " + getApp().globalData.token
```

- 未登录时该表达式求值为 `""`（空串），header 仍存在但为空 —— 因此**匿名接口（`getRegion`、`checkOperationCity`、`getStock` 等）也会带一个空 `Authorization`**。
- token 只从 `globalData` 取，不回落读 storage；`app.js onLaunch` 里 `this.globalData.token = wx.getStorageSync("token") || ""` 负责冷启动回填。
- 部分 WebView 跳转会把 **JWT 直接拼进 URL query**：`../webView/webView?webUrl=<会员中心/押金购卡活动>&token=<jwt>`（`pages/index/index.js` `transformDepositToCard`、还车后 `depositUpgrade` 跳转；`pages/account/account.js` `onJumpVip`；`pages/webView/webView.js` 再拼 `?token=...&orderId=...&prize=...`）。JWT 进入 H5 URL / 浏览器历史 / Referer，属于凭据泄露面。

### 3.9 注销与登出

```js
// pages/login/login.js
logout: function () { wx.clearStorageSync(); clearUserLoginCache(); wx.redirectTo({url:"/pages/loginPre/loginPre"}); },
destroy: function () {
  a.default.dataRequest({ url:"accountDestroy", method:"PUT", bodyParam:{}, callback: function (t) {
    objectDestructuringEmpty(t);                       // @babel helper，等价于断言非空
    wx.redirectTo({ url: "/pages/loginPre/loginPre" });
  }});
}
// PUT /miniMango/v1/account/destroy  {}
```
