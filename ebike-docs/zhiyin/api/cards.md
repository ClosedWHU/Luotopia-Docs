---
title: 卡券 / 营销 / 活动 / 邀请 / 抽奖接口
sidebar_label: 卡券/营销
description: 骑行卡、优惠卡、押金卡、优惠券、活动中心、邀请助力与抽奖等 57 个接口的完整清单与调用方标注。
sidebar_position: 9
---

## 卡券 / 营销 / 活动 / 邀请 / 抽奖（57）

调用方（模块 `5484`/`b22f`/`7381`/`ca41`/`b05c`/`011d`/`d45d`）：`pagesSub/myCard/myCard.js` 与 `myCardExpired.js`（getUserRidingCard/getUserFavorableCard/getDiscountCard/getFreeCard/getUserAccountInfo）、`pagesSub/cardCenter/cardCenter.js`（getServiceRidingCard/getRidingCardList/getPreferentialCardList）、`pagesSub/activityCenter/activityCenter.js`（getActivityCenterList/getRegularList）、`pagesSub/activityDetail/activityDetail.js`（customerActivityDetail/joinCustomerActivity/customerActivityGetReward）、`pagesSub/invitePolite/*`（invitePolite/inviteSharePage/inviteRules/invitationRecord：createInvite/accpetInvite/getInviteDetail/getInviteRecord/inviteRule/userAssistance）、`pagesSub2/inviteHelp/inviteHelp.js`（助力落地页）、`pagesSub/voucher/voucher.js`（userAddVoucher/getValidVoucherCode）、`pagesSub/depositCardStore/depositCardStore.js`（getDepositList）、`pagesSub/wallet/wallet.js`、`pagesSub/rules/rules.js`（卡规则 ridingConfigGetRule/getFavorableRule）、`pagesSub2/pay/pay.js`（getPayPageIsRecommendCardConfig/getDefalutRecommendRideCard/buyingOrder，并引用抽奖模块 `d45d` 的 lotteryActivityEnable）。**抽奖页面 `pagesSub4/lotteryActivity|luckyLot` 仍缺失**（getDraw/getRecords 等的页面调用方无法证实）。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/activities/lottery/chance` | POST | getChance | 抽奖机会查询 | d45d |
| `/client/activities/lottery/detail` | POST | getDetail | 抽奖活动详情 | d45d |
| `/client/activities/lottery/draw` | POST | getDraw | 抽奖 | d45d |
| `/client/activities/lottery/list` | POST | getList | 抽奖活动列表 | d45d |
| `/client/activities/lottery/records` | POST | getRecords | 中奖记录 | d45d |
| `/client/activities/lottery/records/address` | POST | putAddress | 填写中奖收货地址 | d45d |
| `/client/activities/lottery/records/page` | POST | getRecordsPage | 中奖记录分页 | d45d |
| `/client/ad/coupon/tenant/queryCouponList` | POST | queryCouponList | 租户优惠券列表 | 7381 |
| `/client/ad/coupon/user/getCanReduceFlag` | POST | getOrderCanReduceFlag | 订单是否可抵扣 | 7381 |
| `/client/ad/coupon/user/getCouponFlag` | POST | getUserCouponFlag | 用户优惠券角标 | 7381 |
| `/client/ad/coupon/user/queryCouponList` | POST | getDiscountCouponList | 用户优惠券列表 | 7381 |
| `/client/ad/coupon/user/reduce` | POST | useDiscountCoupon | 使用优惠券抵扣 | 7381 |
| `/client/ebike_taishan/activity/sms_recall_reward/query` | POST | getRecallReward | 短信召回奖励查询 | ca41 |
| `/client/helpConfig/getCardPromoteConfigByServiceId` | POST | getCardRecommendConfigApi | 卡片推荐配置 | 7381 |
| `/client/order/izBuyRideCard` | POST | getPayPageIsRecommendCardConfig | 支付页是否推荐骑行卡 | 7381 |
| `/client/order/queryRidingCardSavedAmount` | POST | getRidingCardSavedAmount | 骑行卡累计节省金额 | 7381 |
| `/client/rent/buyingOrder` | POST | markOrderForBugRideCard | 订单标记购买骑行卡（7381 封装，与支付组 buyingOrder 同路径） | 7381 |
| `/client/yearReport/getUser` | POST | getAnnualReport | 年度骑行报告 | ca41 |
| `/client/yearReport/obtainReward` | POST | updateObtainReward | 年度报告领奖 | ca41 |
| `/ebike_account/deposit_card/client/get_user_deposit_card` | POST | getDepositCard | 用户押金卡 | 5484 |
| `/ebike_account/discount/client/get_user_all_discount` | POST | getDiscountCard | 我的折扣卡 | 5484 |
| `/ebike_account/favorable_card/client/get_user_favorable_card` | POST | getUserFavorableCard | 我的优惠卡 | 5484 |
| `/ebike_account/free_order/client/get_user_all_free_order` | POST | getFreeCard | 免单卡列表 | 5484 |
| `/ebike_account/riding_card/client/get_riding_card` | POST | getUserRidingCard | 我的骑行卡 | 5484 |
| `/ebike_account/riding_card/client/get_service_riding_card` | POST | getServiceRidingCard | 服务区在售骑行卡 | b22f |
| `/ebike_account/riding_card/client/is_show_repay_guide` | POST | getRidingCardGuide | 是否展示续费引导 | b22f |
| `/ebike_account/riding_card/client/pop_out_state_when_request` | POST | getTodayRideCardPopupConfig | 骑行卡弹窗频控 | 7381 |
| `/ebike_account/user_account/client/user_account` | POST | getUserAccountInfo | 账户资产汇总(卡券页) | 5484 |
| `/ebike_marketing/activity_center/client/app/activity_center_list` | POST | getActivityCenterList | 活动中心列表 | ca41 |
| `/ebike_marketing/activity_center/client/app/default_activity_center_list` | POST | getRegularList | 常驻活动列表 | ca41 |
| `/ebike_marketing/activity/client/app/accept_invite` | POST | accpetInvite | 接受邀请 | b05c |
| `/ebike_marketing/activity/client/app/annual_reward` | POST | getAnnualReward | 年度奖励 | ca41 |
| `/ebike_marketing/activity/client/app/annual_reward_v2` | POST | getAnnualRewardV2 | 年度奖励V2 | ca41 |
| `/ebike_marketing/activity/client/app/assistance` | POST | userAssistance | 为用户助力 | b05c |
| `/ebike_marketing/activity/client/app/assistance_activity_detail` | POST | getInviteUserDetail | 助力活动详情 | b05c |
| `/ebike_marketing/activity/client/app/create_assistance_activity` | POST | createInviteUser | 创建助力活动 | b05c |
| `/ebike_marketing/activity/client/app/create_invite` | POST | createInvite | 创建邀请 | b05c |
| `/ebike_marketing/activity/client/app/customer_activity_detail` | POST | customerActivityDetail | 客户活动详情 | ca41 |
| `/ebike_marketing/activity/client/app/customer_activity_get_reward` | POST | customerActivityGetReward | 客户活动领奖 | ca41 |
| `/ebike_marketing/activity/client/app/invite_detail` | POST | getInviteDetail | 邀请详情 | b05c |
| `/ebike_marketing/activity/client/app/invite_record` | POST | getInviteRecord | 邀请记录 | b05c |
| `/ebike_marketing/activity/client/app/invite_rule` | POST | inviteRule | 邀请规则 | b05c |
| `/ebike_marketing/activity/client/app/join_customer_activity` | POST | joinCustomerActivity | 参加客户活动 | ca41 |
| `/ebike_marketing/activity/client/app/regular_get_register_reward` | POST | regularGetRegisterReward | 常驻注册奖励领取 | ca41 |
| `/ebike_marketing/activity/client/app/regular_get_verify_reward` | POST | regularGetVerifyReward | 常驻实名奖励领取 | ca41 |
| `/ebike_marketing/activity/client/app/second_kill_buy` | POST | SecondKillBuy | 秒杀购买 | ca41 |
| `/ebike_marketing/activity/client/app/user_add_voucher` | POST | userAddVoucher | 用户领取代金券 | 011d |
| `/ebike_marketing/activity/client/platform/get_valid_voucher_code` | POST | getValidVoucherCode | 校验代金券码 | 011d |
| `/ebike_marketing/deposit_config/client/platform/deposit_config_list` | POST | getDepositList | 押金档位配置列表 | 7381 |
| `/ebike_marketing/favorable_config/client/app/get_favorable_rule` | POST | getFavorableRule | 优惠卡规则 | b22f |
| `/ebike_marketing/favorable_config/client/favorable_card` | POST | getFavorableCardDetail | 优惠卡详情 | b22f |
| `/ebike_marketing/favorable_config/client/platform/favorable_card_list` | POST | getPreferentialCardList | 优惠卡商品列表 | b22f |
| `/ebike_marketing/riding_config/client/platform/recommend_card` | POST | getDefalutRecommendRideCard | 默认推荐骑行卡 | 7381 |
| `/ebike_marketing/riding_config/client/platform/riding_config_detail` | POST | getRidinCardDetail | 骑行卡详情 | b22f |
| `/ebike_marketing/riding_config/client/platform/riding_config_get_rule` | POST | ridingConfigGetRule | 骑行卡规则 | b22f |
| `/ebike_marketing/riding_config/client/platform/riding_config_list` | POST | getRidingCardList | 骑行卡商品列表 | b22f |
| `/ebike_marketing/riding_config/client/platform/special_riding_config_detail` | POST | getSpecialCard | 特殊骑行卡详情 | 7381 |
