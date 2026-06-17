using System.Linq.Expressions;

using api.Features.Authentication.Common;
using api.Features.Authentication.Login;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Configuration;

using Moq;

namespace api.UnitTests.Features.Authentication.Login;

public class LoginHandlerTests
{
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly IConfiguration _configuration;
    private readonly LoginHandler _handler;
    private readonly List<User> _usersInDb;

    public LoginHandlerTests()
    {
        Mock<IUserStore<User>> userStoreMock = new Mock<IUserStore<User>>();
        _userManagerMock = new Mock<UserManager<User>>(
            userStoreMock.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Jwt:Secret", "A_Very_Long_And_Super_Secure_Secret_Key_For_Ops_Core_2026!" },
                { "Jwt:Issuer", "OpsCoreAPI" },
                { "Jwt:Audience", "OpsCoreClients" },
                { "Jwt:ExpiryDays", "30" }
            })
            .Build();

        _handler = new LoginHandler(_userManagerMock.Object, _configuration);
        _usersInDb = new List<User>();

        TestAsyncEnumerable<User> mockUsers = new TestAsyncEnumerable<User>(_usersInDb);
        _userManagerMock.Setup(u => u.Users).Returns(mockUsers);

        _userManagerMock.Setup(u => u.FindByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((string email) => _usersInDb.FirstOrDefault(u => u.Email == email));
    }

    [Fact]
    public async Task HandleAsync_ValidEmailAndPassword_ReturnsToken()
    {
        // Arrange
        User user = new User
        {
            Id = "user-1",
            Email = "operator@opscore.com",
            UserName = "opeope",
            EmployeeId = "0001"
        };
        _usersInDb.Add(user);

        LoginCommand command = new LoginCommand
        {
            Identifier = "operator@opscore.com",
            Password = "Password123!"
        };

        _userManagerMock.Setup(u => u.CheckPasswordAsync(user, command.Password))
            .ReturnsAsync(true);

        _userManagerMock.Setup(u => u.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Operator" });

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Token);
        Assert.Null(result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_ValidEmployeeIdAndPassword_ReturnsToken()
    {
        // Arrange
        User user = new User
        {
            Id = "user-2",
            Email = "supervisor@opscore.com",
            UserName = "supsup",
            EmployeeId = "0002"
        };
        _usersInDb.Add(user);

        LoginCommand command = new LoginCommand
        {
            Identifier = "0002",
            Password = "Password123!"
        };

        _userManagerMock.Setup(u => u.CheckPasswordAsync(user, command.Password))
            .ReturnsAsync(true);

        _userManagerMock.Setup(u => u.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Supervisor" });

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Token);
        Assert.Null(result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_InvalidPassword_ReturnsFailure()
    {
        // Arrange
        User user = new User
        {
            Id = "user-3",
            Email = "tech@opscore.com",
            UserName = "tectec",
            EmployeeId = "0003"
        };
        _usersInDb.Add(user);

        LoginCommand command = new LoginCommand
        {
            Identifier = "tech@opscore.com",
            Password = "WrongPassword!"
        };

        _userManagerMock.Setup(u => u.CheckPasswordAsync(user, command.Password))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Null(result.Token);
        Assert.Equal("Invalid credentials.", result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_UserNotFound_ReturnsFailure()
    {
        // Arrange
        LoginCommand command = new LoginCommand
        {
            Identifier = "nonexistent@opscore.com",
            Password = "Password123!"
        };

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Null(result.Token);
        Assert.Equal("Invalid credentials.", result.ErrorMessage);
    }
}

internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
{
    private readonly IQueryProvider _inner;

    internal TestAsyncQueryProvider(IQueryProvider inner)
    {
        _inner = inner;
    }

    public IQueryable CreateQuery(Expression expression)
    {
        return new TestAsyncEnumerable<TEntity>(expression);
    }

    public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
    {
        return new TestAsyncEnumerable<TElement>(expression);
    }

    public object? Execute(Expression expression)
    {
        return _inner.Execute(expression);
    }

    public TResult Execute<TResult>(Expression expression)
    {
        return _inner.Execute<TResult>(expression);
    }

    public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
    {
        var expectedResultType = typeof(TResult).GetGenericArguments()[0];
        object? executionResult = typeof(IQueryProvider)
            .GetMethods()
            .First(m => m.Name == nameof(IQueryProvider.Execute) && m.IsGenericMethod)
            .MakeGenericMethod(expectedResultType)
            .Invoke(_inner, new[] { expression });

        return (TResult)typeof(Task).GetMethod(nameof(Task.FromResult))!
            .MakeGenericMethod(expectedResultType)
            .Invoke(null, new[] { executionResult })!;
    }
}

internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
{
    public TestAsyncEnumerable(IEnumerable<T> enumerable) : base(enumerable)
    { }

    public TestAsyncEnumerable(Expression expression) : base(expression)
    { }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
    }

    IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
}

internal class TestAsyncEnumerator<T>(IEnumerator<T> inner) : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _inner = inner;

    public T Current => _inner.Current;

    public ValueTask DisposeAsync()
    {
        _inner.Dispose();
        return ValueTask.CompletedTask;
    }

    public ValueTask<bool> MoveNextAsync()
    {
        return ValueTask.FromResult(_inner.MoveNext());
    }
}
