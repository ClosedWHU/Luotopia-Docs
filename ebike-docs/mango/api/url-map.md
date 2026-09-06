---
title: URL 表全量 key（附录 A）
sidebar_label: URL 表全量
description: utils/util.js URL 表的规模与结构特征（全量 key 清单存档于私有仓）。
sidebar_position: 8
---

## URL 表结构概述

`utils/util.js` 的 URL 表共 **100 个 key**（按源码顺序编排），其中：

- **98 个**指向 `api.mangoebike.com`（前缀 `/miniMango/v1/*`，文件上传走 `/oss/*`）；
- **2 个**为外部占位（微信统一下单与微信接口凭证端点），**均未调用**——凭证端点里还留着 `appid=APPID&secret=APPSECRET` 未替换占位符，属早期直连方案的残留；
- **16 个**为带路径参数的函数型 key（订单/工单/支付校验/商城/地址等明细操作），统一形如「以参数拼接完整路径」；
- **6 个 key 在已还原代码中从未被调用**（见[未定位调用点](./uncalled.md)）；
- **6 组 key 两两指向同一路径**（库存/钱包/订单/工单/登录/二维码），属重复定义、维护成本高（见[其他发现](../findings.md)）；
- 若干 key 名照抄了服务端路径拼写错误（search→serach、valid→vaild、parking→plaking、buy→bug），客户端无法纠正。

> [!NOTE]
> 全量 key 清单（源码顺序）与函数型 key 的路径模板存档于私有仓 `whu-ebike-re`；各 key 的能力类别见本目录其余各页。
