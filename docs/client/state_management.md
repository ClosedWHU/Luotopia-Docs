# 状态管理 (Riverpod)

Luotopia 客户端使用 **flutter_riverpod** 进行状态管理，遵循响应式编程范式，提供更简洁高效的状态定义和依赖注入。

## 1. Riverpod 核心概念

### Provider：声明式状态的最小单位

Provider 是 Riverpod 中的核心概念，用于声明一段逻辑和其产生的值。每个 Provider：

- **声明自己的依赖**: 通过 `ref.watch()` 声明依赖的其他 Provider
- **自动缓存**: 只要依赖不变，结果被自动缓存
- **自动刷新**: 当依赖变化时，自动重新计算值
- **完全类型安全**: 支持完整的类型推断

### 对比 Bloc

| 特性 | Bloc | Riverpod |
|-----|------|---------|
| 定义状态 | Event → Bloc → State | 直接 Provider |
| 代码行数 | 3 个文件（Event、State、Bloc） | 1 个文件 |
| 依赖管理 | 手动注入 | 自动注入和缓存 |
| 异步处理 | Stream、Future 混合 | FutureProvider、StreamProvider |
| 学习曲线 | 中等 | 低 |

## 2. Provider 类型详解

### 2.1 ValueProvider - 简单值

```dart
// 声明
final nameProvider = Provider<String>((ref) => 'Luotopia');

// 使用
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = ref.watch(nameProvider);
    return Text(name); // 'Luotopia'
  }
}
```

### 2.2 StateProvider - 可修改状态

```dart
// 声明
final counterProvider = StateProvider<int>((ref) => 0);

// 使用 - 读取值
final count = ref.watch(counterProvider);

// 使用 - 修改值
ref.read(counterProvider.notifier).state = 10;  // 直接赋值
ref.read(counterProvider.notifier).update((prev) => prev + 1);  // 更新
```

### 2.3 FutureProvider - 异步操作

```dart
// 声明：从 API 获取帖子列表
final postsProvider = FutureProvider<List<Post>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  return await api.getPosts();
});

// 使用
class PostListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(postsProvider);
    
    return postsAsync.when(
      data: (posts) => ListView.builder(
        itemCount: posts.length,
        itemBuilder: (context, index) => PostTile(posts[index]),
      ),
      loading: () => Center(child: CircularProgressIndicator()),
      error: (error, stackTrace) => Center(child: ErrorWidget(error: error)),
    );
  }
}
```

### 2.4 StreamProvider - 持续流数据

```dart
// 声明：监听通知流
final notificationsProvider = StreamProvider<Notification>((ref) {
  final api = ref.watch(apiServiceProvider);
  return api.notificationsStream();
});

// 使用
class NotificationListener extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsProvider);
    
    return notificationsAsync.when(
      data: (notification) => NotificationBanner(notification),
      loading: () => SizedBox.shrink(),  // 等待第一个通知
      error: (_, __) => SizedBox.shrink(),  // 处理错误
    );
  }
}
```

### 2.5 StateNotifierProvider - 复杂状态管理

当需要多个方法操作状态时使用：

```dart
// 定义 StateNotifier
class FilterNotifier extends StateNotifier<FilterState> {
  FilterNotifier() : super(FilterState.initial());
  
  void setCourse(String courseId) {
    state = state.copyWith(courseId: courseId);
  }
  
  void setDepartment(String dept) {
    state = state.copyWith(department: dept);
  }
  
  void reset() {
    state = FilterState.initial();
  }
}

// 声明 Provider
final filterProvider = StateNotifierProvider<FilterNotifier, FilterState>((ref) {
  return FilterNotifier();
});

// 使用
class FilterWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(filterProvider);
    
    return Column(
      children: [
        DropdownButton<String>(
          value: filter.courseId,
          onChanged: (value) {
            ref.read(filterProvider.notifier).setCourse(value!);
          },
          items: // 课程列表
        ),
        ElevatedButton(
          onPressed: () => ref.read(filterProvider.notifier).reset(),
          child: Text('重置'),
        ),
      ],
    );
  }
}

// 定义状态类
class FilterState {
  final String? courseId;
  final String? department;
  
  FilterState({this.courseId, this.department});
  
  factory FilterState.initial() => FilterState();
  
  FilterState copyWith({String? courseId, String? department}) {
    return FilterState(
      courseId: courseId ?? this.courseId,
      department: department ?? this.department,
    );
  }
}
```

## 3. 在 UI 中使用

### 3.1 ConsumerWidget（推荐）

```dart
// 继承 ConsumerWidget 而非 StatelessWidget
class PostListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // ref 参数提供了 watch、read、listen 等方法
    final posts = ref.watch(postsProvider);
    
    return Scaffold(
      appBar: AppBar(title: Text('帖子')),
      body: posts.when(
        data: (items) => ListView(...),
        loading: () => CircularProgressIndicator(),
        error: (err, stack) => ErrorWidget(),
      ),
    );
  }
}
```

### 3.2 ConsumerStatefulWidget（需要生命周期）

```dart
class PostDetailScreen extends ConsumerStatefulWidget {
  final int postId;
  
  const PostDetailScreen({required this.postId});

  @override
  ConsumerState<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends ConsumerState<PostDetailScreen> {
  @override
  void initState() {
    super.initState();
    // 在生命周期中可以使用 ref
    ref.refresh(postDetailsProvider(widget.postId));
  }

  @override
  Widget build(BuildContext context) {
    final post = ref.watch(postDetailsProvider(widget.postId));
    
    return Scaffold(
      body: post.when(
        data: (item) => SingleChildScrollView(
          child: PostDetail(post: item),
        ),
        loading: () => CircularProgressIndicator(),
        error: (err, stack) => ErrorWidget(),
      ),
    );
  }
}
```

### 3.3 ref 的三种用法

```dart
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // 1. watch - 当值变化时重新构建 Widget（用于 UI 更新）
    final value = ref.watch(myProvider);
    
    // 2. read - 只读一次，不会自动刷新（用于事件处理）
    ElevatedButton(
      onPressed: () {
        final currentValue = ref.read(myProvider);
        print('Current value: $currentValue');
      },
      child: Text('Click'),
    );
    
    // 3. listen - 监听变化并执行回调（用于副作用）
    ref.listen(authProvider, (previous, current) {
      if (previous?.isLoggedIn == false && current.isLoggedIn == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('登录成功！')),
        );
      }
    });
    
    return Container();
  }
}
```

## 4. 依赖注入

Provider 之间可以通过 `ref.watch()` 相互依赖，形成自动的依赖图：

```dart
// API 服务 Provider
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

// 获取用户信息 - 依赖于 apiServiceProvider
final currentUserProvider = FutureProvider<User>((ref) async {
  final api = ref.watch(apiServiceProvider);
  return await api.getCurrentUser();
});

// 获取用户的帖子 - 同时依赖 currentUserProvider 和 apiServiceProvider
final userPostsProvider = FutureProvider<List<Post>>((ref) async {
  final user = await ref.watch(currentUserProvider.future);
  final api = ref.watch(apiServiceProvider);
  return await api.getPostsByUserId(user.id);
});
```

## 5. 参数化 Provider

```dart
// 使用 .family 修饰符创建参数化 Provider
final postProvider = FutureProvider.family<Post, int>((ref, postId) async {
  final api = ref.watch(apiServiceProvider);
  return await api.getPost(postId);
});

// 使用
class PostScreen extends ConsumerWidget {
  final int postId;
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final post = ref.watch(postProvider(postId));  // 传递参数
    
    return post.when(
      data: (item) => PostDetail(post: item),
      loading: () => CircularProgressIndicator(),
      error: (err, stack) => ErrorWidget(),
    );
  }
}
```

## 6. 缓存与刷新

### 自动缓存

Provider 的值在依赖未变时自动缓存，不会重新计算：

```dart
final expensiveProvider = FutureProvider<Data>((ref) async {
  // 这个计算只在 dependencies 变化时执行一次
  return await _computeExpensiveData();
});
```

### 手动刷新

```dart
class MyScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(expensiveProvider);
    
    return Column(
      children: [
        // 显示数据
        if (data is AsyncData) Text(data.value.toString()),
        
        // 刷新按钮
        ElevatedButton(
          onPressed: () {
            // 刷新单个 Provider
            ref.refresh(expensiveProvider);
            
            // 或刷新所有 Provider（核选项）
            // ref.invalidateAll();
          },
          child: Text('重新加载'),
        ),
      ],
    );
  }
}
```

## 7. 错误处理

### FutureProvider 中的错误

```dart
final dataProvider = FutureProvider<Data>((ref) async {
  try {
    final api = ref.watch(apiServiceProvider);
    return await api.fetchData();
  } catch (e) {
    // 异常会被包装在 AsyncError 中
    // 在 UI 中可以通过 error 状态捕获
    throw Exception('数据加载失败: $e');
  }
});

// UI 处理
class DataWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(dataProvider);
    
    return asyncData.when(
      data: (data) => DataDisplay(data: data),
      loading: () => CircularProgressIndicator(),
      error: (error, stackTrace) {
        // 在这里处理错误，比如显示 SnackBar
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('错误: $error')),
          );
        });
        return ErrorView(error: error);
      },
    );
  }
}
```

## 8. 最佳实践

### ✅ 推荐

```dart
// 1. 使用小而专的 Provider
final userNameProvider = Provider<String>((ref) {
  final user = ref.watch(currentUserProvider);
  return user.name;
});

// 2. 使用 family 进行参数化
final commentProvider = FutureProvider.family<Comment, int>((ref, id) async {
  final api = ref.watch(apiServiceProvider);
  return await api.getComment(id);
});

// 3. 在 StateNotifier 中处理复杂逻辑
class UserNotifier extends StateNotifier<User> {
  UserNotifier() : super(User.initial());
  
  void updateName(String newName) => state = state.copyWith(name: newName);
  void updateEmail(String newEmail) => state = state.copyWith(email: newEmail);
}

// 4. 使用 when 处理所有状态
asyncData.when(
  data: (data) => SuccessWidget(data),
  loading: () => LoadingWidget(),
  error: (err, stack) => ErrorWidget(error: err),
);
```

### ❌ 避免

```dart
// 1. 在 Provider 中执行副作用（如登录日志）
// ❌ 不好
final authProvider = FutureProvider<Auth>((ref) async {
  final auth = await api.authenticate();
  analytics.logEvent('user_logged_in');  // 副作用！
  return auth;
});

// ✅ 好
final authProvider = FutureProvider<Auth>((ref) async {
  return await api.authenticate();
});

// 在 UI 层处理副作用
ref.listen(authProvider, (prev, current) {
  if (current is AsyncData) {
    analytics.logEvent('user_logged_in');
  }
});

// 2. 过度嵌套依赖
// ❌ 不好：A → B → C → D → E
// ✅ 好：扁平化设计，必要时才嵌套

// 3. 在 build 方法中修改状态
// ❌ 不好
Widget build(BuildContext context, WidgetRef ref) {
  ref.read(counterProvider.notifier).state++;  // build 时执行！
  return Container();
}

// ✅ 好
onPressed: () {
  ref.read(counterProvider.notifier).state++;  // 事件处理时执行
}
```

## 9. 常见问题

**Q: 如何在 Provider 中使用 BuildContext？**  
A: 不要。使用 `ref.listen` 在 UI 层处理上下文相关逻辑。

**Q: 如何在应用启动时初始化 Provider？**  
A: 在 `main.dart` 中使用 `ref.refresh()` 预加载必要的 Provider。

**Q: 性能是否会因为 Provider 数量增加而下降？**  
A: 不会。Riverpod 的缓存机制确保只重新计算实际变化的部分。

---

[返回目录](./index.md)
