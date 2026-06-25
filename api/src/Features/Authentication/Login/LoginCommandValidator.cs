using FluentValidation;

namespace api.Features.Authentication.Login;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Identifier)
            .NotEmpty().WithMessage("Email or Employee ID is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");

        RuleFor(x => x.Identifier)
            .EmailAddress().WithMessage("Invalid email address format.")
            .When(x => !string.IsNullOrEmpty(x.Identifier) && x.Identifier.Contains('@'));
    }
}
