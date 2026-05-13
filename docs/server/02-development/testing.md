# 测试规范与实践

高质量的测试是 Luotopia Server 能够持续重构而不破坏功能的保证。我们要求所有核心逻辑必须具备单元测试。

## 1. 测试金字塔
- **单元测试 (Unit Tests)**: 针对单个函数或模块逻辑。使用 Mock 模拟外部依赖。
- **集成测试 (Integration Tests)**: 验证多个组件间的交互（如 Handler -> Service -> Repo）。通常需要内存数据库（SQLite）或真实的测试库。
- **E2E 测试 (End-to-End)**: 模拟真实 HTTP 请求，验证整个 API 链路。

## 2. 工具链
- **Testify**: 用于断言 (`assert`, `require`) 和 Mock。
- **Go Mock**: `github.com/stretchr/testify/mock`。
- **Huma Test**: 用于验证 API 响应。

## 3. Mock 编写规范
为了保持测试的独立性，我们通常为数据库接口编写 Mock 类：

```go
type MockDatabase struct {
    mock.Mock
}

func (m *MockDatabase) GetUserByID(id uint64) (*models.User, error) {
    args := m.Called(id)
    if args.Get(0) != nil {
        return args.Get(0).(*models.User), args.Error(1)
    }
    return nil, args.Error(1)
}
```

## 4. 编写一个典型的 API 测试
API 测试应覆盖成功路径和典型的失败路径（如 400, 401, 404）。

```go
func TestUserHandler_Login(t *testing.T) {
    // 1. 准备环境
    gin.SetMode(gin.TestMode)
    mockDB := new(MockDatabase)
    handler := NewLegacyUserHandler(mockDB)
    
    // 2. 设置期望
    mockDB.On("GetUserByUsername", "testuser").Return(&models.User{...}, nil)
    
    // 3. 执行操作
    input := &UserLoginInput{...}
    res, err := handler.Login(context.Background(), input)
    
    // 4. 断言结果
    assert.NoError(t, err)
    assert.NotNil(t, res.Body.Token)
    mockDB.AssertExpectations(t)
}
```

## 5. 运行测试
运行所有测试：
```bash
go test ./...
```

生成覆盖率报告：
```bash
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## 6. 注意事项
- **不可变性**: 测试不应修改本地环境（如真实的配置文件）。
- **清理**: 在涉及文件系统或真实数据库的测试中使用 `defer` 进行清理。
- **并发**: 避免测试间的竞争条件，尽量使用独立的上下文。
