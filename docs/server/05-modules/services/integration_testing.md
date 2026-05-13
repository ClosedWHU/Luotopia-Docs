# 集成测试框架

为了确保各个业务模块在集成后的正确性，Luotopia 提供了完整的集成测试框架，支持模拟数据库、缓存和外部服务。

## 框架架构

### 核心组件

```go
package testing

// TestEnv 集成测试环境
type TestEnv struct {
	DB         *sql.DB
	Cache      cache.Cache
	SearchEngine search.SearchEngine
	Logger     *log.Logger
	Config     *config.Config
}

// SetupTestEnv 初始化测试环境
func SetupTestEnv(t *testing.T) *TestEnv {
	// 1. 启动容器化依赖
	db := setupTestDB(t)
	cache := setupTestCache(t)
	search := setupTestSearch(t)
	
	// 2. 运行数据库迁移
	runMigrations(t, db)
	
	// 3. 初始化日志
	logger := log.New(os.Stdout, "[TEST]", log.LstdFlags)
	
	// 4. 加载测试配置
	cfg := config.Load("./config/test.json")
	
	return &TestEnv{
		DB:           db,
		Cache:        cache,
		SearchEngine: search,
		Logger:       logger,
		Config:       cfg,
	}
}

// TeardownTestEnv 清理测试环境
func TeardownTestEnv(env *TestEnv) {
	env.DB.Close()
	env.Cache.Close()
}
```

### 依赖管理

#### Docker Compose 配置

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: luotopia_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test123
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
```

启动测试环境：
```bash
docker-compose -f docker-compose.test.yml up -d
```

## 使用指南

### 基础集成测试

```go
package forum_test

import (
	"context"
	"testing"
	
	"luotopia/internal/forum"
	testutil "luotopia/internal/testing"
)

func TestCreatePost_Success(t *testing.T) {
	// 1. 初始化测试环境
	env := testutil.SetupTestEnv(t)
	defer testutil.TeardownTestEnv(env)
	
	// 2. 初始化服务
	postService := forum.NewPostService(
		forum.NewPostRepository(env.DB),
		env.SearchEngine,
		env.Cache,
	)
	
	// 3. 执行测试
	ctx := context.Background()
	post, err := postService.CreatePost(ctx, &forum.CreatePostRequest{
		Title:   "测试帖子",
		Content: "这是一条测试帖子内容",
		AuthorID: 1001,
	})
	
	// 4. 验证结果
	if err != nil {
		t.Fatalf("创建帖子失败: %v", err)
	}
	
	if post.ID == 0 {
		t.Error("期望得到有效的帖子 ID")
	}
	
	if post.Title != "测试帖子" {
		t.Errorf("帖子标题不匹配: 期望 '测试帖子', 实际 '%s'", post.Title)
	}
}
```

### Mock 外部服务

```go
func TestCreatePost_SearchIndexing(t *testing.T) {
	env := testutil.SetupTestEnv(t)
	defer testutil.TeardownTestEnv(env)
	
	// Mock 搜索引擎
	mockSearch := &testutil.MockSearchEngine{}
	mockSearch.On("Index", mock.Anything, "posts", mock.Anything).
		Return(nil)
	
	postService := forum.NewPostService(
		forum.NewPostRepository(env.DB),
		mockSearch,
		env.Cache,
	)
	
	ctx := context.Background()
	post, err := postService.CreatePost(ctx, &forum.CreatePostRequest{
		Title:    "可搜索的帖子",
		Content:  "包含可搜索内容",
		AuthorID: 1001,
	})
	
	if err != nil {
		t.Fatalf("创建帖子失败: %v", err)
	}
	
	// 验证搜索引擎被调用
	mockSearch.AssertCalled(t, "Index", mock.Anything, "posts", mock.Anything)
}
```

### 数据库事务测试

```go
func TestConcurrentPostCreation(t *testing.T) {
	env := testutil.SetupTestEnv(t)
	defer testutil.TeardownTestEnv(env)
	
	postService := forum.NewPostService(
		forum.NewPostRepository(env.DB),
		env.SearchEngine,
		env.Cache,
	)
	
	ctx := context.Background()
	
	// 并发创建帖子
	const numGoroutines = 10
	errors := make(chan error, numGoroutines)
	
	for i := 0; i < numGoroutines; i++ {
		go func(id int) {
			_, err := postService.CreatePost(ctx, &forum.CreatePostRequest{
				Title:    fmt.Sprintf("并发帖子 %d", id),
				Content:  fmt.Sprintf("内容 %d", id),
				AuthorID: uint64(id + 1000),
			})
			errors <- err
		}(i)
	}
	
	// 检查所有操作成功
	for i := 0; i < numGoroutines; i++ {
		if err := <-errors; err != nil {
			t.Errorf("并发操作 %d 失败: %v", i, err)
		}
	}
	
	// 验证所有帖子已创建
	posts, _ := postService.ListPosts(ctx, &forum.ListPostsQuery{Limit: 100})
	if len(posts) != numGoroutines {
		t.Errorf("期望 %d 条帖子，实际 %d 条", numGoroutines, len(posts))
	}
}
```

### 缓存一致性测试

```go
func TestCacheInvalidation(t *testing.T) {
	env := testutil.SetupTestEnv(t)
	defer testutil.TeardownTestEnv(env)
	
	postService := forum.NewPostService(
		forum.NewPostRepository(env.DB),
		env.SearchEngine,
		env.Cache,
	)
	
	ctx := context.Background()
	
	// 创建帖子
	post, _ := postService.CreatePost(ctx, &forum.CreatePostRequest{
		Title:    "可缓存的帖子",
		Content:  "内容",
		AuthorID: 1001,
	})
	
	// 第一次读取（缓存未命中）
	post1, _ := postService.GetPost(ctx, post.ID)
	
	// 第二次读取（应该从缓存读取）
	post2, _ := postService.GetPost(ctx, post.ID)
	
	if !reflect.DeepEqual(post1, post2) {
		t.Error("缓存内容不一致")
	}
	
	// 更新帖子
	postService.UpdatePost(ctx, post.ID, &forum.UpdatePostRequest{
		Title: "更新后的标题",
	})
	
	// 第三次读取（缓存应已失效，应读取新数据）
	post3, _ := postService.GetPost(ctx, post.ID)
	
	if post3.Title != "更新后的标题" {
		t.Error("缓存未正确失效")
	}
}
```

## 最佳实践

### 1. 测试隔离
每个测试应独立运行，不依赖其他测试的数据或状态。

```go
func TestExample(t *testing.T) {
	// 为每个测试创建独立的环境
	env := testutil.SetupTestEnv(t)
	defer testutil.TeardownTestEnv(env)
	
	// 在独立的测试数据库中运行
	// ...
}
```

### 2. 断言清晰
使用有意义的错误信息，便于调试失败的测试。

```go
// ❌ 不好
if err != nil {
	t.Fatal(err)
}

// ✅ 好
if err != nil {
	t.Fatalf("创建用户失败: %v (邮箱: %s)", err, email)
}
```

### 3. 测试数据管理
使用 Fixture 或 Factory 模式创建可复用的测试数据。

```go
// Factory 模式
func createTestUser(t *testing.T, db *sql.DB, email string) *User {
	user := &User{Email: email, Name: "Test User"}
	if err := db.Create(user).Error; err != nil {
		t.Fatalf("创建测试用户失败: %v", err)
	}
	return user
}

// 使用
func TestExample(t *testing.T) {
	env := testutil.SetupTestEnv(t)
	user := createTestUser(t, env.DB, "test@example.com")
	// ...
}
```

### 4. 性能测试
对关键路径进行基准测试，防止性能退化。

```go
func BenchmarkPostSearch(b *testing.B) {
	env := testutil.SetupTestEnv(&testing.T{})
	defer testutil.TeardownTestEnv(env)
	
	service := forum.NewPostService(...)
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		service.SearchPosts(context.Background(), "golang")
	}
}
```

## 常见问题

**Q: 如何在测试中重置数据库？**  
A: 使用 `TRUNCATE TABLE` 命令清空表格：
```go
func CleanupDB(db *sql.DB, tables ...string) error {
	for _, table := range tables {
		if _, err := db.Exec(fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table)); err != nil {
			return err
		}
	}
	return nil
}
```

**Q: 测试运行很慢，如何优化？**  
A: 
- 使用内存数据库（如 SQLite）进行快速测试
- 将慢速集成测试标记为 `integration` 标签
- 使用 `-short` 标志跳过长时间运行的测试

**Q: 如何处理随机失败的测试？**  
A: 通常由于：
- 时序问题（异步操作未完成）：使用 WaitFor 轮询
- 并发冲突：确保数据隔离
- 外部服务不稳定：增加重试逻辑

---

[返回服务列表](./index.md)
