---
title: 广告接口
sidebar_label: 广告
description: 广告配置、曝光/点击/关闭上报、激励视频、福利中心、广告反馈与第三方广告端点共 26 个接口的完整清单。
sidebar_position: 12
---

## 广告（26）

调用方：`components/x-ad/x-ad.js`、`components/x-smart-ad-shield`、`components/x-marketing-popup`；分包 `pagesSub2/welfareCenter/welfareCenter.js`（福利中心：`getUserFlzxConfigList({serviceId})`、`reportUserEnterFlzx({userPin})`，模块 `415e`）、`pagesSub2/adFeedback/adFeedback.js`（getFeedbackTypeList、submitAdFeedback）、`pagesSub2/adFeedbackList/adFeedbackList.js`（getAdFeedbackList）、`pagesSub2/adFeedbackDetail/adFeedbackDetail.js`（getReplayDetail、submitFeedbackReplay），模块 `4e5e`；支付完成广告页 `pagesSub2/paymentResult/paymentResult.js`（见[支付流程](../flows/payment.md)）。第三方跳转见[第三方主机](../overview.md)、签名见[juju 广告签名](../signing.md)。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/ad/checkSecondKill` | POST | getUserChaoJiFlag | 秒杀资格检查 | 415e |
| `/client/ad/clickReport` | POST | adClickReport | 广告点击上报 | 415e |
| `/client/ad/closeReport` | POST | adCloseReport | 广告关闭上报 | 415e |
| `/client/ad/command/transmission` | POST | getCommandContent | 广告指令透传内容 | 415e |
| `/client/ad/complaint/app/getCanComplaintFlag` | POST | getAdComplaintFlag | 广告可投诉标记 | 415e |
| `/client/ad/complaint/app/getTypeList` | POST | getFeedbackTypeList | 广告反馈类型列表 | 4e5e |
| `/client/ad/complaint/app/pageQuery` | POST | getAdFeedbackList | 广告反馈分页 | 4e5e |
| `/client/ad/complaint/app/replay/detail` | POST | getReplayDetail | 广告反馈回复详情 | 4e5e |
| `/client/ad/complaint/app/replay/submit` | POST | submitFeedbackReplay | 广告反馈回复提交 | 4e5e |
| `/client/ad/complaint/app/submit` | POST | submitAdFeedback | 提交广告反馈 | 4e5e |
| `/client/ad/config/getAdConfigForGuest` | POST | getAdConfigForGuest | 游客广告配置 | 415e |
| `/client/ad/config/getAdConfigV3` | POST | getAdConfigV3 | 广告配置V3 | 415e |
| `/client/ad/config/getFlzxConfigList` | POST | getUserFlzxConfigList | 福利中心配置列表 | 415e |
| `/client/ad/config/getShieldSmartAdConfig` | POST | getAdShieldConfig | 智能广告屏蔽配置 | 415e |
| `/client/ad/config/izEnterFlzx` | POST | getUserIzEnterFlzx | 是否进入福利中心 | 415e |
| `/client/ad/config/updateEnterFlzx` | POST | reportUserEnterFlzx | 进入福利中心上报 | 415e |
| `/client/ad/coupon/user/getCouponFlag` | POST | getAdCouponUserFlag | 广告优惠券用户标记 | 415e |
| `/client/ad/exposureReport` | POST | adShowReport | 广告曝光上报 | 415e |
| `/client/ad/monitor/zssz/checkAdLink` | POST | zeshengCheckAdLink | 泽盛广告链接监测 | 415e |
| `/client/ad/present/adVideoPresent` | POST | adVideoPresent | 激励视频广告奖励发放 | 415e |
| `/client/ad/present/izShowAdVideoPresent` | POST | showAdVideoPresent | 激励视频广告是否展示 | 415e |
| `/client/ad/slimeIntegralSync` | POST | slimeIntegralReport | 史莱姆积分同步 | 415e |
| `/client/config/getAd` | POST | getAdsApi | 广告位配置查询 | 415e |
| `/client/management/menuClick/izShow` | POST | showHalfScreenAppYg | 半屏小程序广告展示(频控) | 415e |
| `/ebike_marketing/activity/client/app/user_buy_wallet_judgement` | POST | getAdReward | 看广告得钱包奖励判断 | 415e |
| `https://wxgo.adwke.com/api/miniapp/wechat` | POST | getAdwkeConfig | adwke「广宣」第三方广告配置（thirdPartRequest，无 _s 签名） | 415e |
