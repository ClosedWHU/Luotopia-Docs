# 多端适配与设计规范 (Multi-platform)

Luotopia 客户端旨在通过一套代码支持 **iOS, Android, Web, macOS, Windows 和 Linux**。为了在不同屏幕尺寸和交互方式下保持最佳体验，我们制定了以下适配规范。

## 1. 响应式布局架构
系统集成了 `responsive_framework`，通过断点（Breakpoints）自动调整 UI 缩放与布局。

### 1.1 核心断点配置
- **Mobile**: 0 - 450 (Phone)
- **Tablet**: 451 - 800 (Tablet)
- **Desktop**: 801+ (Desktop/Web)

### 1.2 适配策略：`ResponsiveBreakpoints`
在 `lib/app.dart` 中，我们定义了全局的适配器。对于桌面端，系统会自动启用“自动缩放”以保持比例协调；而对于移动端，则倾向于原生流式布局。

## 2. 交互适配 (UX Adaptation)

### 2.1 导航模式
- **移动端 (Mobile)**: 采用底部导航栏 (`BottomNavigationBar`)，方便单手操作。
- **宽屏 (Desktop/Tablet)**: 自动切换为侧边导航栏 (`NavigationRail` 或自定义 Sidebar)，充分利用水平空间。

### 2.2 悬停与反馈
- **Desktop/Web**: 必须为交互元素添加 `Hover` 效果。利用 `shadcn_flutter` 的内置支持，确保按钮和卡片在鼠标移入时有微妙的视觉变化。
- **Mobile**: 强调长按与滑动手势（如 `flutter_slidable` 列表操作）。

## 3. 跨平台实现细节 (Cross-platform Implementation)
 
### 3.1 平台差异化渲染
利用 `foundation` 包中的 `kIsWeb` 与 `dart:io` 中的 `Platform` 类实现环境感知：
 
```dart
if (kIsWeb) {
  // Web 专用逻辑：适配浏览器特有的 Navigator 行为
} else if (Platform.isMacOS || Platform.isWindows) {
  // 桌面端专用逻辑：处理窗体阴影与自定义标题栏
}
```
 
### 3.2 数据持久化适配
- **移动端 (Mobile)**: 依赖 `path_provider` 进行文件系统读写。
- **Web 端**: 自动重定向至浏览器持久化存储。在开发 Data 层时，应通过接口抽象文件操作，避免直接调用底层路径 API。
 
### 3.3 Web 渲染引擎优化
- **渲染器选择**: 生产环境优先采用 `CanvasKit` 以保障复杂动画与字体的渲染一致性；针对轻量化场景可动态回退至 `HTML` 渲染器。
- **URL 策略**: 深度集成 `GoRouter` 的 Web 历史管理，确保应用状态与浏览器地址栏同步。

## 4. 多端适配常见问题 (FAQ)

**Q: 为什么在 Web 端运行某些插件会崩溃？**
A: 部分原生插件（如 `path_provider`）在 Web 端缺乏实现或行为不一致。建议在调用前通过 `kIsWeb` 进行分支判断，或使用具备 Web 支持的插件版本。

**Q: 如何处理桌面端的窗口大小限制？**
A: 建议在 `app_bootstrap.dart` 中使用 `window_manager` 插件设置最小窗口尺寸，防止 UI 在极端比例下发生布局错乱。

---
[返回目录](./index.md)
