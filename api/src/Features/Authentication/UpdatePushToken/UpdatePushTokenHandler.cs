using api.Data;
using api.Features.Authentication.Common;

using Microsoft.AspNetCore.Identity;

namespace api.Features.Authentication.UpdatePushToken;

public class UpdatePushTokenResult
{
    public bool Succeeded { get; set; }
    public string? ErrorMessage { get; set; }
}

public class UpdatePushTokenHandler(UserManager<User> userManager, AppDbContext dbContext)
{
    private readonly UserManager<User> _userManager = userManager;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<UpdatePushTokenResult> HandleAsync(string userId, UpdatePushTokenCommand command)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return new UpdatePushTokenResult { Succeeded = false, ErrorMessage = "User not found." };
        }

        user.ExpoPushToken = command.ExpoPushToken;

        IdentityResult result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            string errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new UpdatePushTokenResult { Succeeded = false, ErrorMessage = errors };
        }

        return new UpdatePushTokenResult { Succeeded = true };
    }
}
