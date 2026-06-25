using FluentValidation;

namespace api.Features.Incidents.Assign;

public class AssignIncidentCommandValidator : AbstractValidator<AssignIncidentCommand>
{
    public AssignIncidentCommandValidator()
    {
        RuleFor(x => x.TechnicianId)
            .NotEmpty().WithMessage("Technician ID is required.");
    }
}
