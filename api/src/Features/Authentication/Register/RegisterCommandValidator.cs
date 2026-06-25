using api.Data;

using FluentValidation;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Authentication.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator(AppDbContext dbContext)
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(50).WithMessage("First name must not exceed 50 characters.")
            .Matches(@"^[a-zA-Z\s'-]+$").WithMessage("First name contains invalid characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(50).WithMessage("Last name must not exceed 50 characters.")
            .Matches(@"^[a-zA-Z\s'-]+$").WithMessage("Last name contains invalid characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(100).WithMessage("Email must not exceed 100 characters.")
            .EmailAddress().WithMessage("Invalid email address format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
            .Must(HasUppercase).WithMessage("Password must contain at least one uppercase letter.")
            .Must(HasLowercase).WithMessage("Password must contain at least one lowercase letter.")
            .Must(HasDigit).WithMessage("Password must contain at least one digit.")
            .Must(HasSpecialChar).WithMessage("Password must contain at least one special character.");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required.")
            .Must(role => role == "Operator" || role == "Supervisor" || role == "Technician" || role == "Plant Manager")
            .WithMessage("Role must be a valid option (Operator, Supervisor, Technician, Plant Manager).");

        RuleFor(x => x.AreaIds)
            .MustAsync(async (ids, cancellation) =>
            {
                if (ids == null || ids.Count == 0)
                {
                    return true;
                }
                int activeAreasCount = await dbContext.Areas
                    .CountAsync(a => ids.Contains(a.Id) && a.Status == "Active", cancellation);
                return activeAreasCount == ids.Distinct().Count();
            })
            .WithMessage("All assigned areas must exist and be active.");

        RuleFor(x => x.ShiftId)
            .MustAsync(async (id, cancellation) => !id.HasValue || await dbContext.Shifts.AnyAsync(s => s.Id == id.Value && s.Status == "Active", cancellation))
            .WithMessage("Shift must exist and be active.");

        RuleFor(x => x.SpecialityId)
            .NotEmpty().When(x => x.Role == "Technician").WithMessage("Speciality is required for technicians.")
            .MustAsync(async (id, cancellation) => !id.HasValue || await dbContext.Specialities.AnyAsync(s => s.Id == id.Value && s.Status == "Active", cancellation))
            .WithMessage("Speciality must exist and be active.");
    }

    private bool HasUppercase(string password)
    {
        return !string.IsNullOrEmpty(password) && password.Any(char.IsUpper);
    }

    private bool HasLowercase(string password)
    {
        return !string.IsNullOrEmpty(password) && password.Any(char.IsLower);
    }

    private bool HasDigit(string password)
    {
        return !string.IsNullOrEmpty(password) && password.Any(char.IsDigit);
    }

    private bool HasSpecialChar(string password)
    {
        return !string.IsNullOrEmpty(password) && password.Any(ch => !char.IsLetterOrDigit(ch));
    }
}
