---
title: 贡献指南
sidebar_label: 贡献指南
description: 文档与代码贡献约定
sidebar_position: 3
---
# 贡献指南

欢迎修 Bug、改文档、加功能。

## 文档

```bash
cd docs
npm install
npm start    # 预览
npm run build  # 提交前建议跑通（死链会失败）
```

- 三分区：`user-docs/` → `/user`，`client-docs/` → `/client`，`server-docs/` → `/server`  
- 风格见 [style_guide](./style_guide.md)  
- 中文优先写清步骤与边界，少空话  

## 代码

| 端 | 约定 |
|----|------|
| 服务端 | 业务在 `server/internal/domains/<domain>/`；入口 `serve` / `worker` / `cli` |
| 客户端 | `app/lib` feature-first + Riverpod；**Material 3 only** |

- 提交前：服务端 `go test`（相关包）；文档 `npm run build`  
- **禁止**把生产密钥、私钥提交进库  
- 公开文档深度遵守 [公开文档边界](./public_docs_policy.md)（契约可写，闭源实现与密钥不可写）  

## PR 说明

- 标题清晰，如 `docs: 修正 metrics 默认不暴露`  
- 行为变更写清兼容 / 迁移  

## 相关

- [站点首页](pathname:///)
- [用户指南](pathname:///user/) · [客户端](pathname:///client/)
- [服务端贡献规范](../development/contributing.md)
