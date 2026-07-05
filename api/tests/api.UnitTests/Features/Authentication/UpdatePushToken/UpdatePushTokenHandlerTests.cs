using api.Features.Authentication.Common;
using api.Features.Authentication.UpdatePushToken;

using Microsoft.AspNetCore.Identity;

using Moq;

namespace api.UnitTests.Features.Authentication.UpdatePushToken;

public class UpdatePushTokenHandlerTests
{
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly UpdatePushTokenHandler _handler;

    public UpdatePushTokenHandlerTests()
    {
        Mock<IUserStore<User>> userStoreMock = new Mock<IUserStore<User>>();
        _userManagerMock = new Mock<UserManager<User>>(
            userStoreMock.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        _handler = new UpdatePushTokenHandler(_userManagerMock.Object, null!);
    }

    [Fact]
    public async Task HandleAsync_UserNotFound_ReturnsFailedResult()
    {
        // Arrange
        string userId = "nonexistent-user";
        UpdatePushTokenCommand command = new UpdatePushTokenCommand("ExponentPushToken[12345]");

        _userManagerMock.Setup(u => u.FindByIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act
        UpdatePushTokenResult result = await _handler.HandleAsync(userId, command);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal("User not found.", result.ErrorMessage);
    }

    [Fact]
    public async Task HandleAsync_UserFoundAndUpdated_ReturnsSuccessResult()
    {
        // Arrange
        string userId = "user-1";
        UpdatePushTokenCommand command = new UpdatePushTokenCommand("ExponentPushToken[12345]");
        User user = new User { Id = userId };

        _userManagerMock.Setup(u => u.FindByIdAsync(userId))
            .ReturnsAsync(user);

        _userManagerMock.Setup(u => u.UpdateAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        UpdatePushTokenResult result = await _handler.HandleAsync(userId, command);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Null(result.ErrorMessage);
        Assert.Equal("ExponentPushToken[12345]", user.ExpoPushToken);
    }
}
