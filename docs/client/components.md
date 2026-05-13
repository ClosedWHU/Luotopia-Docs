# UI 组件库

Luotopia 客户端采用 **Material 3** 设计语言，并在 `lib/shared/presentation/widgets` 中封装了一系列通用组件，以保证全站视觉的一致性。

## 1. 基础布局组件

### `AppBarBuilder`
统一的顶栏构建器，支持透明度渐变、沉浸式状态栏及多端适配。
- **参数**: `title`, `actions`, `isSliver`。

## 2. 交互与选择器

### `AppDateTimePickers`
针对武大教务系统风格定制的时间选择器。
- **功能**: 支持周次选择、节次选择（1-13 节）以及常规的日期时间选择。

### `AppDurationPicker`
用于设定“提醒时间”或“倒计时”的持续时间选择器，支持自定义刻度与步长。

## 3. 设计规范与主题 (Theme)

所有自定义组件均通过 `context.theme` 访问全局配色：
- **Primary**: 用于核心按钮、活动状态。
- **Surface**: 容器底色。
- **Error**: 错误提示、危险操作（如注销、删除帖子）。

---
[返回目录](./index.md)
