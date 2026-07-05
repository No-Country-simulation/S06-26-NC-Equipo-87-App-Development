using FluentValidation;

namespace api.Features.Authentication.UpdatePushToken;

public class UpdatePushTokenValidator : AbstractValidator<UpdatePushTokenCommand>
{
    public UpdatePushTokenValidator()
    {
        RuleFor(x => x.ExpoPushToken)
            .Must(token => string.IsNullOrEmpty(token) || (token.StartsWith("ExponentPushToken[") && token.EndsWith("]")))
            .WithMessage("Invalid Expo Push Token format.");
    }
}
