# 项目架构

Luotopia 客户端遵循 **Clean Architecture** 结合 **Riverpod** 响应式编程范式，确保代码的可测试性、可维护性和高效的状态管理。

## 1. 目录结构 (`lib/`)

```text
lib/
├── core/
│   ├── providers/        # Riverpod 全局 Provider 定义
│   ├── services/         # 业务服务层（不包含UI逻辑）
│   └── models/           # 数据模型定义
├── features/             # 功能模块
│   ├── forum/
│   ├── course/
│   └── ...
├── shared/
│   ├── widgets/          # 可复用的 UI 组件
│   ├── utils/            # 工具函数
│   └── constants/        # 常量定义
└── main.dart             # 应用入口
```

## 2. 状态管理（Riverpod）

Riverpod 提供了比 Bloc 更简洁的响应式编程模型：

- **Provider**: 声明式地定义状态、计算值和依赖
- **StateNotifier**: 管理可变状态并暴露修改方法
- **ConsumerWidget/ConsumerStatefulWidget**: 在 UI 中监听 Provider 并自动重建
- **自动依赖注入**: Provider 之间可以通过 `ref.watch()` 相互依赖

```dart
// 示例：API 服务 Provider
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

// 示例：异步数据 Provider
final postsProvider = FutureProvider<List<Post>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  return await api.getPosts();
});
```

## 3. 网络请求流程

1. **Models**: 使用 `json_serializable` 生成的 DTO
2. **Services**: 使用 `http` 包进行 HTTP 请求
3. **Providers**: 通过 FutureProvider 或 StateNotifierProvider 管理异步数据和状态
4. **UI**: ConsumerWidget 监听 Provider，自动更新 UI

更多详情请查看 [状态管理](./state_management.md)

---
[返回目录](./index.md)
