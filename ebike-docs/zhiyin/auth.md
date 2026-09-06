---
title: 认证与会话
sidebar_label: 认证与会话
description: 凭据存储、token 生命周期、十种登录流程与 /oauth/token grant_type 全表、响应包络。
sidebar_position: 2
---

## 3.1 凭据存储（wx storage）

封装：`storageData(key, value?)`（`common/vendor.js` 模块 `0177` 函数 `B`，即 `uni.get/setStorageSync` 包装，`loginInfo` 写入时保留旧 openid）。

| storage key | 内容 | 写入点 |
|---|---|---|
| `loginInfo` | `{accessToken, refreshToken, openid, …}`（登录响应中除 pin/avatar 外全部字段） | `setUserLogin`（模块 `0177`） |
| `userInfo` | `{pin, avatar, phone, ridingState, izAuth, serviceId, wxPayScoreType, …}` | `setUserLogin`/`setUserInfo` |
| `serviceId` | 当前服务区 ID（`userInfo.serviceId` 同步） | `setUserInfo` |
| `openId` | wx.login code 换取的 openid（支付/人脸用） | `common/main.js` onLaunch、模块 `49c2` getUserOpenId |
| `configData` | `/client/tenant/config` 租户运行时配置 | `common/main.js` fetchTenantConfig |
| 其他 | `scanCarId`、`bikeType`、`eBikePayAction`（防重复支付）、`hasWxPayScoreConfirmed`、`wechatPayScoreAppid`、`faceResultSuccessTime`、`DEBUG_Run*` 等（完整 34 个 key 见[其他发现](./findings.md)） | 各处 |

## 3.2 token 生命周期

- **携带方式**：所有业务请求 header `Authorization: Bearer <loginInfo.accessToken>`（模块 `0177` generateAjaxParams）。
- **刷新**：响应 `code=="00005"||"00013"`（token 过期/临期）→ 请求层（模块 `1244` 函数 `M`）将当前请求入队 `L`，用 `POST /oauth/token`，body `{grant_type:"refresh_token", refresh_token: loginInfo.refreshToken}`（Basic 认证头，见[公共参数与 `_s` 签名](./signing.md)）静默刷新；成功后合并新 `loginInfo`（删除响应中的 pin 字段、保留 openid）并**自动重放**队列中的请求；失败则登出。
- **登出**（`j()`，模块 `1244`）：清空 storage（`setUserLogout` 移除 `userInfo`/`loginInfo`/`serviceId`），并按 code 分流：
  - `00006`：静默登出（当前页为 `pagesSub2/userInfo` 时不处理），响应标记 `isHideApiError`；
  - `00015`：弹「登录失效」→ 跳转 `/pagesSub2/quickLogin/quickLogin`；
  - `00001` 且 url 为 `/oauth/token`：登出；
  - `/oauth/logout`、`/client/order/config/get` 在豁免名单 `E` 中不触发上述处理。设置页退出登录（`pagesSub/setting/setting.js` `logout()`）仅调用本地 `setUserLogout()` 清 storage + reLaunch 地图页，**不请求 `/oauth/logout`**——该接口在全部已还原代码中无调用方（仅存在于豁免名单）。
- **请求防重放窗口**：`REQUEST_ID = requestId_<rand1e15>_<ts>`，请求发起前若已延迟 >60s 直接拦截失败（模块 `1244` 函数 `U`）。

## 3.3 登录流程

1. **App 启动（静默）**：`common/main.js`（模块 `e4a4` onLaunch）→ `uniLogin()`（模块 `0177` 函数 `R`，包装 `uni.login` 取 jsCode）→ `getOpenIdByJsCode({code})` = `POST /ebike_pay/pay/client/wxlite/get_access_token` → 存 `openId`。此步只取 openid，不产生会话。
2. **登录页实体**（主包 `pages/quickLogin`、`pages/phoneLogin` 仅做 redirectTo，真实页面在 `pagesSub2`）：`pagesSub2/quickLogin/quickLogin`（微信一键登录主入口）、`pagesSub2/phoneLogin/phoneLogin`（手机号输入）、`pagesSub2/smsVerification/smsVerification`（验证码）、`pagesSub2/quickLogin/phoneManager`（多账号管理）、`pagesSub2/quickLogin/components/pickPhoneNumberModal`（多账号选择弹窗）。
3. **微信一键登录（getPhoneNumber）**：`quickLogin.wxml` 中 `<button openType="getPhoneNumber" bindgetphonenumber="__e">`（uni-app 编译产物，data-event-opts 映射到 `useLoginByPhoneNumber($event)`）。回调流程（`pagesSub2/quickLogin/quickLogin.js`）：
   - 先 `$Log` 记录原始回调 → `checkPrivacySetting`（微信隐私协议弹窗，返回 code 1 时提示「授权成功，请继续点击登录」并中止本次）；
   - `e.detail.iv && e.detail.encryptedData` 存在 → `submitQuickLogin(e.detail, "wechat_miniapp")`：**走旧版 encryptedData/iv 加密数据方案，不是新版 phone code**；
   - `submitQuickLogin` 组装 `POST /oauth/token` body：`{grant_type:"wechat_miniapp", appId:"wx8df7475fde0271c6"(ext.platform["mp-weixin"].appid), js_code:<wx.login code>, encryptedData:<detail.encryptedData>, iv:<detail.iv>}`，header 为 Basic `base64("<tenantId>:<platformSecret>")`（值已脱敏，见[公共参数与 `_s` 签名](./signing.md)）；
   - `e.detail.errno===1400001`（用户拒绝授权）且 `loginConfigType==="WeChatLoginPriority"` 时回退 `useLoginByOpenId()`；否则 toast「快捷登录失败,请选择手机号登录/注册」。**注意**：`loginConfigType` 在本包中**从未被赋值**（声明为 null，全库仅此页 5 处读取），该回退分支实际不可达；
   - `js_code` 保鲜：页面每 **4 分钟**（`setInterval(getJsCode, 24e4)`）重新 `wx.login` 刷新；
   - 成功后 `setUserLogin(data)`（模块 `0177`）→ Vuex + `userInfo`/`loginInfo` 拆分存储 → 按 `path` 参数回跳（扫码车/代付单/地图页），并调用 `agreeProtocol`（`/client/user/agreeProtocol`）上报协议同意；新用户命中奖励分组时走 `newLoginSuccessRewardGroup`。
4. **loginConfigType 按钮形态（本包恒为默认分支）**：代码支持 `OpenIDLogin`/`OpenIDLoginPriority`/`WeChatLoginPriority` 三种登录按钮形态，但 `loginConfigType` 全库无赋值点（恒 null）→ 实际总走默认分支 `showOpenIdLogin=!isNewUser`（老用户额外显示 openid 快捷登录按钮，新用户隐藏）。`getUserAccountList()` = `uniLogin()` 取 js_code（失败则 reject）→ `getLoginAccounts({appId, js_code})`（`/oauth/socialUserList`）拉取该微信下已绑定手机号列表，列表为空判定 `isNewUser` → redirectTo `phoneLogin`。「手机号登录」入口显隐由 `getTenantLoginConfig()`（`/client/tenant/config/getTenantConfig`）响应的 `izCloseMsgCodeLogin` 控制（`resolveShowPhoneLoginEntry`，模块 `0177`）。
5. **openid 快捷登录（老用户免验证码）**：`useLoginByOpenId()` 中 `isNewUser` → 跳 phoneLogin；`loginConfigType` 非空 → 弹 `pickPhoneNumberModal`（手机号脱敏多账号选择，`choosePhoneCompleted` 回调）；否则（本包实际路径）直接取 `accountList[0]` → `submitQuickLogin(account, "wechat_openid")`，body `{grant_type:"wechat_openid", appId, js_code, phone:<账号 phone>}`。
6. **短信验证码登录**：`phoneLogin.js` 输入手机号 → `loginBeforeSendCode({phone:"+86-…"})`（`/client/user/loginBeforeSendCode`，错误码 `14056`=虚拟手机号拦截）→ redirectTo `smsVerification?phoneNum=…` → `sendMsgCode({phone:"+86-…", scene:1})`（`/client/code/send`，scene 1=登录、4=换绑；60s 倒计时）→ 输满 6 位自动提交 `userLogin({grant_type:"phone_code", phone:"+86-…", messageCode:<code>})`（`/oauth/token`）。**当 ext `security:true` 时**（知音 ext `security:false`，未启用）改用 `{grant_type:"phone_code", phone:encryptText("+86-…"), messageCode:encryptText(code), security:true}`——`encryptText` 即模块 `aef2` AES-256-CBC（见[加密模块](./crypto.md)）。`codeType=2`（换绑场景）验证通过后改调 `changeThirdBind({phone, code, thirdType:4})`（`/client/userAuthInfo/changeThirdBind`）。
7. **多账号切换/删除（phoneManager）**：`pagesSub2/quickLogin/phoneManager.js`——onShow `uniLogin()` 取 js_code → `getLoginAccounts({appId, js_code})`（`/oauth/socialUserList`）渲染脱敏手机号列表；`clickDeletePhone` 限制**列表 ≥2 个号码才允许删除**，确认后 `removeLoginAccount({socialUserId:<record.id>})`（`/oauth/removeSocialUser`）→ 刷新列表。
8. **第三方小程序免登**：`pages/launch/launch.js`（模块 `1b5f` `thirdPartyNoLogin`）——仅当 `platformTenantId ∈ {1,2,5,2860}` 且启动 `referrerInfo.extraData` 存在时，直接把 extraData 作为登录凭据 `userLogin(extraData)`（知音 tenantId=1534，**此路径不生效**）。
9. **邀请页内嵌登录**：`pagesSub/invitePolite/inviteSharePage.js` 落地页自带验证码登录（同 `grant_type:"phone_code"` + `userLogin`），供被邀请人未登录时注册。
10. **H5 免登（getShortToken）**：`pagesSub/help/help.js`、`pagesSub/customerService/customerService.js` 的 `goAiCustomerServicePage()` → `getShortToken()`（`POST /oauth/generateShortToken`）→ `gotoAi()` 将 shortToken 拼入 AI 客服 H5 URL（ext.aiCustomerService.entranceUrl）经 `pages/webview` 打开。

**`/oauth/token` grant_type 取值全表**：

| grant_type | 附加参数 | 场景 | 来源 |
|---|---|---|---|
| `wechat_miniapp` | `appId, js_code, encryptedData, iv` | 微信一键登录（getPhoneNumber 旧版加密数据） | `pagesSub2/quickLogin/quickLogin.js` |
| `wechat_openid` | `appId, js_code, phone` | 微信下已绑定账号免验证码登录 | 同上 |
| `phone_code` | `phone("+86-…"), messageCode`（security 模式为密文+`security` 字段） | 短信验证码登录/注册 | `pagesSub2/smsVerification/smsVerification.js`、`pagesSub/invitePolite/inviteSharePage.js` |
| `alipay_miniapp` | `authCode, appId, encryptedData` | 支付宝端一键登录（知音仅微信端，代码路径保留） | `pagesSub2/quickLogin/quickLogin.js` |
| `refresh_token` | `refresh_token` | 静默刷新（请求层） | `common/vendor.js` 模块 `1244` |

## 3.4 响应包络

统一 `{success: bool, code: "00000"…, msg, data}`；请求层仅在 `success` 或特定 code 时 resolve（模块 `1244` 函数 `M`）。业务侧常见错误码：`21010` 支付需先实名、`24015` 押金重复缴纳、`24016/24017` 重复支付、开锁 `17012` 转蓝牙、`15047` 车辆未备案、`15030` 余额不足。
