---
title: 登录 / 用户 / 实名接口
sidebar_label: 登录/用户/实名
description: 登录、实名认证、人脸核验、换绑、注销、信用分等 83 个接口的完整清单与调用方标注。
sidebar_position: 1
---

## 统计口径与通用说明（344 个，按模块分组）

- 除标注外均为 `POST`，JSON body，走[请求封装层](../signing.md)（自动附加公共参数 + `_t/_s/_ssv` + `Authorization` + `X-App-Id`；开锁四接口另加 `deviceToken`）。
- 「模块」= `common/vendor.js` 中的 webpack API 定义模块；调用方按真实页面文件标注。`pagesSub3`/`pagesSub4`（抽奖、年度报告、互动弹窗、校园卡绑定、评价提交、信用分、骑行任务等页）无源码，相关调用方无法标注。
- 独立端点（不在下表中）：
  - `POST /client/tenant/config/clientDomain` —— 域名池刷新（模块 `1d0c`，带完整签名）；
  - `POST {logApi}/log/app`、`POST {logApi}/log/event` —— 日志批量上报（模块 `4250`，无签名）。

> 各组接口路径、方法、函数名、用途见各页表格（由 `common/vendor.js` 全部 30 个 API 定义模块自动提取并人工标注）。

## 登录 / 用户 / 实名（83）

调用方：`common/main.js`（onLaunch openId）、`pages/launch/launch.js`（thirdPartyNoLogin→userLogin、getUserinfo）、`common/vendor.js` 模块 `49c2`/`80db`/`90b5`。登录三件套真实页面：`pagesSub2/quickLogin/quickLogin.js`（`/oauth/token` wechat_miniapp/wechat_openid、`/oauth/socialUserList`）、`pagesSub2/quickLogin/phoneManager.js`（`/oauth/socialUserList`、`/oauth/removeSocialUser`）、`pagesSub2/phoneLogin/phoneLogin.js`（`/client/user/loginBeforeSendCode`）、`pagesSub2/smsVerification/smsVerification.js`（`/client/code/send`、`/oauth/token` phone_code、`/client/userAuthInfo/changeThirdBind`）、`pagesSub/invitePolite/inviteSharePage.js`（phone_code 内嵌登录），流程详见[登录流程](../auth.md)。实名链路：`pagesSub2/verified/verified.js`（userAuth、getUserAuthInfoListByPhone、getIzSupportSingleAuth；**[aef2 解密](../crypto.md)实名字段**）、`pagesSub/identityAuth/*`（identityAuth/faceScan/faceResult：getFaceVerifyId、tencentFaceAuth→微众 H5、useBikeBeforeFaceCheck(ByWechat)、wechatFaceSupport）、换绑手机 `pagesSub/bindCard/*`（changBindAdd、checkPreviousPhone、changeBindWithFace、withPhoneAviodAudit、cancel）、职业认证 `pagesSub/proCertification/*`（careerAuth/cancelCareerAuth）、注销 `pagesSub/cancelAccount/*`（queryCancelAccount/submitCancel，模块 `d3be`）、支付分开关 `pagesSub/wxPayScore/wxPayScore.js`（getScorePermissionRecord/scorePermission/closeScorePermission）。协议：quickLogin 登录成功后 `agreeProtocol`。**`/oauth/logout` 无调用方**（`pagesSub/setting/setting.js` logout 仅本地 `setUserLogout`，见[token 生命周期](../auth.md)）。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/business/ebike-management/file/upload` | POST | upload | 文件上传（ebike-management 通道） | c24f |
| `/client/code/send` | POST | sendMsgCode | 发送短信验证码 | c24f |
| `/client/ebike-fence/creditScore/getConfig` | POST | getCreditScoreConfig | 信用分围栏配置 | c24f |
| `/client/ebike-user/creditScore/getConfig` | POST | getUserCreditScoreConfig | 用户信用分配置 | c24f |
| `/client/ebike-user/creditScore/learn` | POST | creditScoreLearn | 信用学习恢复信用分 | c24f |
| `/client/ebike-user/creditScore/noRidding/info` | POST | getUserCreditScoreDetail | 禁骑信用分详情 | c24f |
| `/client/ebike-user/creditScore/page` | POST | getUserCreditScoreList | 信用分流水分页 | c24f |
| `/client/ebike-user/creditScore/showLearnEntry` | POST | izShowLearnEntry | 是否显示信用分学习入口 | c24f |
| `/client/helpConfig/queryRecviedCards` | POST | queryRecviedCards | 已领取卡片查询(帮助配置) | c24f |
| `/client/order/learnAvoidFine` | POST | learnAvoidFine | 学习免除调度费/罚款 | c24f |
| `/client/order/showLearnFreeFineBtn` | POST | showLearnFreeFineBtn | 是否显示学习免罚按钮 | c24f |
| `/client/pay/score/getPermissionRecord` | POST | getScorePermissionRecord | 微信支付分授权记录 | c24f |
| `/client/pay/score/permission` | POST | scorePermission | 微信支付分授权申请(获取 apply_permissions_token) | c24f |
| `/client/pay/score/terminatePermission` | POST | closeScorePermission | 解除微信支付分授权 | c24f |
| `/client/system/getFaceAuthConfig` | POST | getFaceAuthConfig | 获取人脸认证配置（创蓝/腾讯） | c24f |
| `/client/system/getUseCarConfig` | POST | getUseCarConfig | 获取用车配置 | c24f |
| `/client/systemConfig/getConfigBaseItem` | POST | getConfigBaseApi | 获取系统基础配置项 | c24f |
| `/client/systemConfig/getConfigRechargeBeforeUse` | POST | getConfigRechargeBeforeUse | 用车前需充值配置 | c24f |
| `/client/tenant/config/list` | POST | configList | 租户配置列表查询 | c24f |
| `/client/tenant/featureSwitch/query` | POST | featureSwitchQuery | 租户功能开关查询 | c24f |
| `/client/user/agreeProtocol` | POST | agreeProtocol | 上报同意用户协议/隐私政策 | c24f |
| `/client/user/auth` | POST | userAuth | 提交实名认证（附加定位参数，模块 `80db` 包装） | c24f |
| `/client/user/auth/getFaceVerifyId` | POST | getFaceVerifyId | 获取人脸核验 ID（附加定位参数） | c24f |
| `/client/user/auth/getVerifyId` | POST | getWechatFaceVerifyId | 获取微信人脸核验 ID | c24f |
| `/client/user/auth/izNeed` | POST | checkUserizNeedAuth | 查询是否需要实名认证 | c24f |
| `/client/user/auth/report` | POST | userAuthByWechat | 微信实名信息认证上报 | c24f |
| `/client/user/auth/state` | POST | checkVerify | 查询实名认证状态 | c24f |
| `/client/user/auth/tencentFaceAuth` | POST | tencentFaceAuth | 腾讯云人脸核身 | c24f |
| `/client/user/blacklist/info` | POST | getBlacklistDetail | 查询用户黑名单详情 | c24f |
| `/client/user/career/cancel` | POST | cancelCareerAuth | 取消职业认证 | c24f |
| `/client/user/career/upload` | POST | careerAuth | 职业认证（学生/教师等）材料上传 | c24f |
| `/client/user/changBind/add` | POST | changBindAdd | 换绑手机-提交申请 | c24f |
| `/client/user/changeBind/cancel` | POST | cancel | 取消换绑申请 | c24f |
| `/client/user/changeBind/checkPreviousPhone` | POST | checkPreviousPhone | 换绑手机-校验原手机号 | c24f |
| `/client/user/changeBind/withFace` | POST | changeBindWithFace | 换绑手机-人脸核验方式 | c24f |
| `/client/user/changeBind/withPhoneAviodAudit` | POST | withPhoneAviodAudit | 换绑手机-免审核 | c24f |
| `/client/user/checkUserAgree` | POST | checkUserAgree | 查询用户协议同意状态 | c24f |
| `/client/user/claimRegisterReward` | POST | claimRegisterReward | 领取注册奖励 | c24f |
| `/client/user/config/enable` | POST | getUserEnableConfig | 用户功能开关配置 | c24f |
| `/client/user/experiment/getBucketRidingCards` | POST | getBucketRidingCards | 实验分桶骑行卡列表 | c24f |
| `/client/user/experiment/getGroup` | POST | getGroup | 获取用户实验分组(A/B) | c24f |
| `/client/user/hasUnusedRewardAsset` | POST | getHasUnusedRewardAsset | 查询未使用奖励资产 | c24f |
| `/client/user/loginBeforeSendCode` | POST | loginBeforeSendCode | 发送登录验证码前置校验 | c24f |
| `/client/user/rentCheck` | POST | useBikeBeforeFaceCheck | 用车前人脸检查 | c24f |
| `/client/user/rentCheckReport` | POST | useBikeBeforeFaceCheckByWechat | 微信人脸核验结果上报 | c24f |
| `/client/user/reward/card` | POST | getRewardCard | 领取奖励卡 | c24f |
| `/client/user/specialConfig` | POST | specialConfig | 用户特殊配置 | c24f |
| `/client/user/thirdPartyOrder/authorize` | POST | thirdPartyOrderAuthorize | 第三方订单授权 | c24f |
| `/client/user/thirdPartyOrder/checkEnabled` | POST | thirdPartyOrderCheckEnabled | 第三方订单功能开关 | c24f |
| `/client/user/thirdPartyOrder/queryAuthStatus` | POST | thirdPartyOrderQueryAuthStatus | 第三方订单授权状态 | c24f |
| `/client/user/user/cancelAccount` | POST | queryCancelAccount | 注销账户前置查询 | d3be |
| `/client/user/user/getIzAgreePrivacyPolicy` | POST | getIzAgreePrivacyPolicy | 查询是否已同意隐私政策 | c24f |
| `/client/user/user/getIzSupportSingleAuth` | POST | getIzSupportSingleAuth | 查询是否支持单次实名 | c24f |
| `/client/user/user/getIzUserAuthByPin` | POST | getIzUserAuthByPin | 按 pin 查询实名信息 | c24f |
| `/client/user/user/getUserAuthInfoListByPhone` | POST | getUserAuthInfoListByPhone | 按手机号查询实名信息列表 | c24f |
| `/client/user/user/getVerificationCode` | POST | getVerificationCode | 获取/校验手机验证码 | c24f |
| `/client/user/user/hideAuthPopup` | POST | isRemindRealName | 不再提醒实名弹窗标记 | c24f |
| `/client/user/user/location` | POST | getServiceInfo | 上报定位获取所在服务区(serviceId) | c24f |
| `/client/user/user/personInfo` | POST | getUserinfo | 获取用户信息（pin、实名、骑行态、余额等） | c24f |
| `/client/user/user/qualificationList` | POST | getQualificationList | 查询用车资格(押金/免押)列表 | c24f |
| `/client/user/user/submitCancel` | POST | submitCancel | 提交注销账户 | d3be |
| `/client/user/user/thirdBindInfo` | POST | getThirdBindInfo | 查询第三方绑定信息 | c24f |
| `/client/user/user/update` | POST | updateAvatar | 更新昵称/头像 | c24f |
| `/client/user/wx/group` | POST | getWxGroup | 查询微信用户分群 | c24f |
| `/client/userAuthInfo/changeThirdBind` | POST | changeThirdBind | 变更第三方(微信)绑定 | c24f |
| `/ebike_account/user_account/client/user_account` | POST | userAccount | 查询用户账户信息 | c24f |
| `/ebike_account/user_credits/client/carbon_credits_rate` | POST | getCarbonCreditRate | 碳积分兑换比率 | c24f |
| `/ebike_account/user_credits/client/get_credits` | POST | getUserCarbonCredit | 查询用户碳积分 | c24f |
| `/ebike_marketing/activity/client/app/get_user_bus_transfer` | POST | getUserBusTransfer | 公交换乘优惠查询 | c24f |
| `/ebike_marketing/activity/client/app/get_user_bus_transfer_list` | POST | getUserBusTransferList | 公交换乘优惠列表 | c24f |
| `/ebike_marketing/activity/client/app/switch_on` | POST | switchOn | 营销活动总开关 | c24f |
| `/ebike_marketing/activity/client/app/user_reward_notify` | POST | checkReward | 用户奖励到账通知查询 | c24f |
| `/ebike_marketing/activity/client/app/verify_notify` | POST | checkIsOpenVerifyNotify | 实名认证奖励活动查询 | c24f |
| `/ebike_marketing/activity/client/mianmi_marketing_content` | POST | getMarketingContent | 免密营销内容查询 | c24f |
| `/ebike_pay/contract/client/query_status` | POST | aliQueryStatus | 支付宝免密代扣签约状态查询 | c24f |
| `/ebike_pay/pay/client/alilite/get_access_token` | POST | getBuyerIdByJsCode | 支付宝 jsCode 换取 buyer_id | c24f |
| `/ebike_pay/pay/client/refund` | POST | refundDeposit | 押金退款 | c24f |
| `/ebike_pay/pay/client/wxlite/get_access_token` | POST | getOpenIdByJsCode | wx.login code 换取 openid | c24f |
| `/oauth/generateShortToken` | POST | getShortToken | 生成短时 token（H5/webview 免登；调用方：`pagesSub/help/help.js`、`pagesSub/customerService/customerService.js` AI 客服） | c24f |
| `/oauth/logout` | POST | —（**无调用方**：`pagesSub/setting/setting.js` logout() 仅本地 setUserLogout，不请求该接口；仅存在于豁免名单） | 退出登录 | 模块 `1244` 名单 E |
| `/oauth/removeSocialUser` | POST | removeLoginAccount | 解绑/移除社交登录账号（调用方：`pagesSub2/quickLogin/phoneManager.js`，参数 `{socialUserId}`） | c24f |
| `/oauth/socialUserList` | POST | getLoginAccounts | 查询社交(微信)登录账号列表（调用方：`pagesSub2/quickLogin/quickLogin.js`、`phoneManager.js`，参数 `{appId, js_code}`） | c24f |
| `/oauth/token` | POST | userLogin | OAuth2 登录/刷新 token（Basic 认证；grant_type 全表见[登录流程](../auth.md)） | c24f |
