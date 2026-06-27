using FluentValidation;

namespace api.Features.Incidents.Close;

public class CloseIncidentValidator : AbstractValidator<CloseIncidentCommand>
{
    public CloseIncidentValidator()
    {
        RuleFor(x => x.SolutionApplied)
            .NotEmpty()
            .WithMessage("Solution applied is required.")
            .MinimumLength(20)
            .WithMessage("Solution applied must be at least 20 characters.")
            .MaximumLength(500)
            .WithMessage("Solution applied cannot exceed 500 characters.");
    }
}
