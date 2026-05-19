# 客户端 API 对接指南

本指南详细说明如何在 Luotopia Flutter 客户端中集成和使用 API 服务。

## 1. API 模型代码生成

### 1.1 OpenAPI 定义同步

Luotopia 使用 OpenAPI 3.0 规范定义 API，服务器自动生成对应文档：

```bash
# 访问服务器生成的 OpenAPI 文档
curl http://localhost:8080/openapi.json > server_api.json

# 或通过 Web 界面查看
http://localhost:8080/docs     # Huma 自动生成的交互式 UI
http://localhost:8080/scalar   # Scalar 替代 UI
```

### 1.2 使用 OpenAPI Generator 生成 Dart 代码

```bash
# 安装 openapi-generator-cli
brew install openapi-generator-cli

# 生成 Dart 模型和 HTTP 客户端
openapi-generator-cli generate \
  -i http://localhost:8080/openapi.json \
  -g dart-dio \
  -o ./lib/generated/api \
  --additional-properties=pubName=luotopia_api

# 参数说明：
# -i: OpenAPI 文件 URL 或路径
# -g: 生成器类型（dart-dio 用于 Dio HTTP 客户端）
# -o: 输出目录
# --additional-properties: 额外配置
```

### 1.3 build_runner 自动生成

如果项目使用 `build_runner`，可自动生成序列化代码：

```yaml
# pubspec.yaml
dev_dependencies:
  build_runner: ^2.4.0
  json_serializable: ^6.7.0
  retrofit_generator: ^7.0.0
```

```bash
# 运行代码生成
flutter pub run build_runner build --delete-conflicting-outputs

# 监视文件变化并自动生成
flutter pub run build_runner watch --delete-conflicting-outputs
```

## 2. HTTP 客户端配置

### 2.1 Dio 基础配置

```dart
import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

class ApiClient {
  late Dio _dio;
  
  ApiClient({String baseUrl = 'http://localhost:8080'}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Luotopia-App/1.0',
      },
    ));
    
    // 添加日志拦截器（开发环境）
    if (kDebugMode) {
      _dio.interceptors.add(
        PrettyDioLogger(
          requestHeader: true,
          compact: false,
          maxWidth: 90,
        ),
      );
    }
  }
  
  Dio get dio => _dio;
}
```

### 2.2 令牌管理与自动刷新

```dart
class TokenInterceptor extends Interceptor {
  final TokenStorage _tokenStorage;
  final AuthService _authService;
  
  TokenInterceptor({
    required TokenStorage tokenStorage,
    required AuthService authService,
  })  : _tokenStorage = tokenStorage,
        _authService = authService;
  
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // 为每个请求添加 Authorization header
    final token = await _tokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }
  
  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // 处理 401 Unauthorized - 令牌过期
    if (err.response?.statusCode == 401) {
      try {
        // 尝试刷新令牌
        final newToken = await _authService.refreshToken();
        
        // 保存新令牌
        await _tokenStorage.saveToken(newToken);
        
        // 使用新令牌重试原始请求
        final options = err.requestOptions;
        options.headers['Authorization'] = 'Bearer ${newToken.accessToken}';
        
        final response = await Dio().request(
          options.path,
          options: options,
        );
        
        return handler.resolve(response);
      } catch (e) {
        // 刷新失败，跳转到登录
        _authService.logout();
        return handler.next(err);
      }
    }
    
    return handler.next(err);
  }
}
```

使用示例：

```dart
class ApiClient {
  late Dio _dio;
  
  ApiClient({
    required TokenStorage tokenStorage,
    required AuthService authService,
  }) {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.whu.sb',
      connectTimeout: Duration(seconds: 10),
    ));
    
    // 添加令牌拦截器
    _dio.interceptors.add(
      TokenInterceptor(
        tokenStorage: tokenStorage,
        authService: authService,
      ),
    );
  }
}
```

### 2.3 错误处理与重试

```dart
class ErrorInterceptor extends Interceptor {
  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // 自定义错误映射
    final apiError = _mapDioError(err);
    
    // 某些错误可自动重试
    if (_shouldRetry(err)) {
      return _retryRequest(err, handler);
    }
    
    // 返回自定义错误
    return handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        error: apiError,
        type: err.type,
        response: err.response,
      ),
    );
  }
  
  ApiError _mapDioError(DioException err) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
        return ApiError(
          code: 'TIMEOUT',
          message: '连接超时，请检查网络',
        );
      case DioExceptionType.receiveTimeout:
        return ApiError(
          code: 'TIMEOUT',
          message: '请求超时，请重试',
        );
      case DioExceptionType.badResponse:
        // 使用服务器返回的错误信息
        final response = err.response;
        return ApiError(
          code: response?.data['code'] ?? 'UNKNOWN',
          message: response?.data['message'] ?? '未知错误',
          statusCode: response?.statusCode,
        );
      default:
        return ApiError(
          code: 'NETWORK_ERROR',
          message: '网络错误，请重试',
        );
    }
  }
  
  bool _shouldRetry(DioException err) {
    // 只重试网络错误和 5xx 错误
    return err.type == DioExceptionType.connectionTimeout ||
        err.response?.statusCode == 502 ||
        err.response?.statusCode == 503;
  }
  
  Future<void> _retryRequest(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    const maxRetries = 3;
    
    for (int i = 0; i < maxRetries; i++) {
      try {
        // 指数退避：等待 2^i 秒
        await Future.delayed(Duration(seconds: 1 << i));
        
        final response = await Dio().request(
          err.requestOptions.path,
          options: Options(
            method: err.requestOptions.method,
            headers: err.requestOptions.headers,
          ),
          data: err.requestOptions.data,
          queryParameters: err.requestOptions.queryParameters,
        );
        
        return handler.resolve(response);
      } catch (e) {
        if (i == maxRetries - 1) {
          return handler.next(err);
        }
      }
    }
  }
}
```

## 3. Retrofit 服务定义

### 3.1 定义 API 服务接口

```dart
import 'package:retrofit/retrofit.dart';
import 'package:dio/dio.dart';

part 'api_service.g.dart';

@RestApi(baseUrl: 'https://api.whu.sb/api/v1')
abstract class ApiService {
  factory ApiService(Dio dio, {String? baseUrl}) = _ApiService;
  
  // 认证 API
  @POST('/user/login')
  Future<LoginResponse> login(@Body() LoginRequest request);
  
  @POST('/user/logout')
  Future<void> logout();
  
  // 论坛 API
  @GET('/forum/feed')
  Future<PostListResponse> getPosts(
    @Query('page') int page,
    @Query('limit') int limit,
    @Query('sort') String sort,
  );
  
  @POST('/forum/posts')
  Future<PostResponse> createPost(@Body() CreatePostRequest request);
  
  @GET('/forum/posts/{id}')
  Future<PostDetailResponse> getPostDetail(@Path('id') String postId);
  
  @PUT('/forum/posts/{id}')
  Future<PostResponse> updatePost(
    @Path('id') String postId,
    @Body() UpdatePostRequest request,
  );
  
  @DELETE('/forum/posts/{id}')
  Future<void> deletePost(@Path('id') String postId);
  
  // 课程 API
  @GET('/course/timetable')
  Future<TimetableResponse> getTimetable(
    @Query('semester') String? semester,
  );
  
  @POST('/course/timetable/batch')
  Future<BatchImportResponse> importTimetable(
    @Body() BatchImportRequest request,
  );
  
  // 搜索 API
  @GET('/search')
  Future<SearchResponse> search(
    @Query('q') String query,
    @Query('type') String type,
    @Query('limit') int limit,
  );
}
```

### 3.2 模型定义示例

```dart
import 'package:json_annotation/json_annotation.dart';

part 'models.g.dart';

@JsonSerializable()
class LoginRequest {
  final String email;
  final String password;
  final bool? rememberMe;
  
  LoginRequest({
    required this.email,
    required this.password,
    this.rememberMe = false,
  });
  
  factory LoginRequest.fromJson(Map<String, dynamic> json) =>
      _$LoginRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

@JsonSerializable()
class LoginResponse {
  @JsonKey(name: 'access_token')
  final String accessToken;
  
  @JsonKey(name: 'token_type')
  final String tokenType;
  
  @JsonKey(name: 'expires_in')
  final int expiresIn;
  
  LoginResponse({
    required this.accessToken,
    required this.tokenType,
    required this.expiresIn,
  });
  
  factory LoginResponse.fromJson(Map<String, dynamic> json) =>
      _$LoginResponseFromJson(json);
  
  Map<String, dynamic> toJson() => _$LoginResponseToJson(this);
}

@JsonSerializable()
class PostResponse {
  final String id;
  final String title;
  final String content;
  @JsonKey(name: 'author_id')
  final String authorId;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  
  PostResponse({
    required this.id,
    required this.title,
    required this.content,
    required this.authorId,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory PostResponse.fromJson(Map<String, dynamic> json) =>
      _$PostResponseFromJson(json);
  
  Map<String, dynamic> toJson() => _$PostResponseToJson(this);
}
```

## 4. Riverpod 与服务集成

### 4.1 API 调用的 Riverpod 实现

使用 Riverpod 进行状态管理比 Bloc 更简洁：

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// 1. API 服务 Provider
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

// 2. 帖子列表 Provider（带分页）
final postsProvider = StateNotifierProvider.family<
    PostsNotifier,
    PostsState,
    int>((ref, page) {
  final apiService = ref.watch(apiServiceProvider);
  return PostsNotifier(apiService: apiService, page: page);
});

// 3. 帖子列表状态
class PostsState {
  final List<PostResponse> posts;
  final bool isLoading;
  final bool hasMore;
  final String? error;
  
  PostsState({
    required this.posts,
    this.isLoading = false,
    this.hasMore = true,
    this.error,
  });
  
  PostsState copyWith({
    List<PostResponse>? posts,
    bool? isLoading,
    bool? hasMore,
    String? error,
  }) {
    return PostsState(
      posts: posts ?? this.posts,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      error: error,
    );
  }
}

// 4. 帖子列表 Notifier
class PostsNotifier extends StateNotifier<PostsState> {
  final ApiService apiService;
  final int page;
  
  PostsNotifier({
    required this.apiService,
    required this.page,
  }) : super(PostsState(posts: [])) {
    _loadPosts();
  }
  
  Future<void> _loadPosts() async {
    try {
      state = state.copyWith(isLoading: true);
      
      final response = await apiService.getPosts(
        page,
        20,  // limit
        'created_at',  // sort
      );
      
      state = state.copyWith(
        posts: response.posts,
        hasMore: response.hasMore,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getErrorMessage(e),
      );
    }
  }
  
  Future<void> createPost(String title, String content) async {
    try {
      await apiService.createPost(
        CreatePostRequest(
          title: title,
          content: content,
        ),
      );
      
      // 重新加载列表
      _loadPosts();
    } catch (e) {
      state = state.copyWith(error: _getErrorMessage(e));
    }
  }
  
  String _getErrorMessage(dynamic error) {
    if (error is DioException) {
      return error.message ?? '网络错误';
    }
    return '未知错误';
  }
}
```

### 4.2 在 UI 中使用 Riverpod

```dart
// 帖子列表屏幕
class PostListScreen extends ConsumerWidget {
  const PostListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // 监听第一页的帖子数据
    final postsAsync = ref.watch(postsProvider(1));
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('帖子列表'),
        actions: [
          // 刷新按钮
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.refresh(postsProvider(1));
            },
          ),
        ],
      ),
      body: postsAsync.when(
        data: (state) {
          if (state.posts.isEmpty) {
            return const Center(child: Text('暂无帖子'));
          }
          
          return ListView.builder(
            itemCount: state.posts.length,
            itemBuilder: (context, index) {
              final post = state.posts[index];
              return PostTile(post: post);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) {
          return Center(
            child: Text('加载失败: $error'),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreatePostDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }
  
  void _showCreatePostDialog(BuildContext context, WidgetRef ref) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('发布新帖'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: const InputDecoration(labelText: '标题'),
            ),
            TextField(
              controller: contentController,
              decoration: const InputDecoration(labelText: '内容'),
              maxLines: 5,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () {
              // 调用 createPost 方法
              ref
                  .read(postsProvider(1).notifier)
                  .createPost(
                    titleController.text,
                    contentController.text,
                  );
              Navigator.pop(context);
            },
            child: const Text('发布'),
          ),
        ],
      ),
    );
  }
}
```

## 5. 端对端测试

### 5.1 集成测试示例

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('ApiService 集成测试', () {
    late ApiService apiService;
    late Dio dio;
    
    setUp(() {
      dio = Dio(BaseOptions(
        baseUrl: 'http://localhost:8080',
      ));
      
      apiService = ApiService(dio);
    });
    
    test('登录流程', () async {
      final response = await apiService.login(
        LoginRequest(
          email: 'test@example.com',
          password: 'password123',
        ),
      );
      
      expect(response.accessToken, isNotEmpty);
      expect(response.tokenType, 'Bearer');
    });
    
    test('创建并获取帖子', () async {
      // 创建帖子
      final createResponse = await apiService.createPost(
        CreatePostRequest(
          title: '测试帖子',
          content: '测试内容',
        ),
      );
      
      expect(createResponse.id, isNotEmpty);
      
      // 获取帖子详情
      final detailResponse = await apiService.getPostDetail(
        createResponse.id,
      );
      
      expect(detailResponse.title, '测试帖子');
      expect(detailResponse.content, '测试内容');
    });
    
    test('列表分页', () async {
      final page1 = await apiService.getPosts(1, 10, 'created_at');
      expect(page1.posts, hasLength(10));
      expect(page1.hasMore, true);
      
      final page2 = await apiService.getPosts(2, 10, 'created_at');
      expect(page2.posts, isNotEmpty);
    });
  });
}
```

## 6. 离线支持与缓存

```dart
class CachedApiService {
  final ApiService _apiService;
  final CacheManager _cacheManager;
  
  CachedApiService({
    required ApiService apiService,
    required CacheManager cacheManager,
  })  : _apiService = apiService,
        _cacheManager = cacheManager;
  
  Future<PostListResponse> getPostsCached({
    int page = 1,
    int limit = 20,
    bool forceRefresh = false,
  }) async {
    final cacheKey = 'posts_page_$page';
    
    if (!forceRefresh) {
      final cached = await _cacheManager.get(cacheKey);
      if (cached != null) {
        return PostListResponse.fromJson(cached);
      }
    }
    
    try {
      final response = await _apiService.getPosts(page, limit, 'created_at');
      
      // 缓存 1 小时
      await _cacheManager.set(
        cacheKey,
        response.toJson(),
        Duration(hours: 1),
      );
      
      return response;
    } catch (e) {
      // 网络失败时返回缓存（即使已过期）
      final staleCache = await _cacheManager.get(cacheKey);
      if (staleCache != null) {
        return PostListResponse.fromJson(staleCache);
      }
      rethrow;
    }
  }
}
```

---

[返回客户端文档](./index.md)
