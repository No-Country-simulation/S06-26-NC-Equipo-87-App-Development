using api.Data;

using FluentValidation;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Incidents.Create;

public class CreateIncidentValidator : AbstractValidator<CreateIncidentCommand>
{
    public CreateIncidentValidator(AppDbContext dbContext)
    {
        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.");

        RuleFor(x => x.AreaId)
            .MustAsync(async (id, cancellation) => await dbContext.Areas.AnyAsync(a => a.Id == id && a.Status == "Active", cancellation))
            .WithMessage("Area must exist and be active.");

        RuleFor(x => x.IncidentTypeId)
            .MustAsync(async (id, cancellation) => await dbContext.IncidentTypes.AnyAsync(t => t.Id == id && t.Status == "Active", cancellation))
            .WithMessage("Incident type must exist and be active.");

        RuleFor(x => x.SeverityTypeId)
            .MustAsync(async (id, cancellation) => await dbContext.SeverityTypes.AnyAsync(s => s.Id == id && s.Status == "Active", cancellation))
            .WithMessage("Severity type must exist and be active.");
    }
}
