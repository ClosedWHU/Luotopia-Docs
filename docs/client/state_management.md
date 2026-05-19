# 状态管理范式 (Riverpod & ViewModel)

Luotopia 客户端不直接在 UI 层处理复杂的业务逻辑，而是采用 **Riverpod + ViewModel** 的分层模式，确保代码的测试性与可维护性。

## 1. 核心架构：ViewModel 模式

在 `lib/features` 下的每个页面模块中，通常包含一个 `presentation/viewmodels` 目录。ViewModel 负责聚合多个数据源，并将复杂的业务状态转化为 UI 直接可用的简单模型。

### 1.1 实现示例：`HomeHeaderViewModel`

以主页顶栏为例，它需要显示：
- 当前选中的校区
- 对应的天气信息
- 用户的个人资料（头像/昵称）

**ViewModel 定义：**
```dart
class HomeHeaderViewModel extends StateNotifier<HomeHeaderState> {
  final Ref _ref;

  HomeHeaderViewModel(this._ref) : super(const HomeHeaderState()) {
    _init();
  }

  void _init() {
    // 1. 监听领域层 Provider 的变化
    _ref.listen(currentCampusProvider, (prev, next) {
      _updateWeather(next);
    });
    
    // 2. 响应式更新状态
    final user = _ref.read(currentUserProvider);
    state = state.copyWith(user: user);
  }
}
```

### 1.2 为什么使用 ViewModel 而非直接用 Provider？
- **聚合性**: 一个页面往往依赖 3-5 个不同的 `Shared/Domain` 数据源。ViewModel 作为中继站，将这些异构数据聚合为一份 `State`。
- **UI 无关性**: ViewModel 中严禁出现 `BuildContext` 或 `Widget` 引用。所有的交互（如点击切换校区）都通过 ViewModel 的方法（如 `onCampusChanged`）完成。

## 2. 响应式编程原则 (Reactive Programming Principles)
 
Luotopia 充分利用 Riverpod 的 **响应式依赖图 (Reactive Dependency Graph)** 来管理数据流：
 
- **依赖追踪 (`ref.watch`)**: 在 Provider 内部观测其他数据源。当被观察的 Provider 发生变更时，Riverpod 会自动重新计算相关逻辑，确保状态的一致性。
- **副作用管理 (`ref.listen`)**: 在 ViewModel 内部通过 `listen` 处理非 UI 更新类的副作用（如校区变更后触发本地数据库的预加载逻辑）。
 
## 3. 状态不可变性 (Immutability)
 
系统要求所有状态模型（State）必须具备不可变性，以简化调试并优化渲染性能：
 
```dart
@immutable
class HomeHeaderState {
  final User? user;
  final Weather? weather;
  final bool isLoading;

  // 通过 copyWith 确保状态更新的原子性与可预测性
  HomeHeaderState copyWith({User? user, Weather? weather, bool? isLoading}) {
    return HomeHeaderState(
      user: user ?? this.user,
      weather: weather ?? this.weather,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}
```
 
## 4. 资源生命周期管理
 
- **自动销毁 (`.autoDispose`)**: 页面级的 ViewModel 必须声明 `autoDispose`，以便在页面从路由栈移除时自动释放内存及取消未完成的网络请求。
- **参数化 Provider (`.family`)**: 对于需要依赖外部 ID（如帖子详情）的场景，使用 `family` 动态实例化针对特定资源的 ViewModel。

## 5. 状态管理常见问题 (FAQ)

**Q: 什么时候应该使用 ref.read 而非 ref.watch？**
A: `ref.read` 仅应在方法内部（如按钮点击回调）用于获取当前状态或发起 Action。在构建逻辑（build 方法）中，**必须**使用 `ref.watch` 以响应状态变更。

**Q: ViewModel 之间是否可以直接通信？**
A: 不建议。建议将共享状态提升到全局 Provider 中，或者通过 `ref.watch` 一个 ViewModel 暴露出的状态来实现响应式联动。

---
[返回目录](./index.md)
