---
title: 文档站贡献指南
sidebar_label: 贡献指南
description: 文档站（docs.whu.sb）贡献约定
sidebar_position: 3
---

欢迎修正与补充文档站内容。服务端代码规范见 [服务端开发规范](../development/contributing.md)。

## 本地预览

```bash
cd docs
npm install
npm start      # 预览
npm run build  # 提交前建议跑通（死链会失败）
```

## 写作约定

- 三分区：`user-docs/` → `/user`，`client-docs/` → `/client`，`server-docs/` → `/server`
- 风格与排版见 [文档风格](./style_guide.md)
- 深度边界见 [公开文档边界](./public_docs_policy.md)：契约可写，闭源实现与密钥不可写
- 中文优先写清步骤与边界，少空话

## PR 说明

- 标题清晰，如 `docs: 修正 metrics 默认不暴露`
- 行为变更写清兼容 / 迁移
- 提交前跑通 `npm run build`（`onBrokenLinks: throw`，死链会失败）

## 相关

- [站点首页](pathname:///)
- [用户指南](pathname:///user/) · [客户端](pathname:///client/)
- [服务端开发规范](../development/contributing.md)
