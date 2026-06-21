using FluentValidation;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Incidents.Create;

[ApiController]
[Route("api/incidents")]
[Tags("Incidents")]
public class CreateIncidentEndpoint(CreateIncidentHandler handler, IValidator<CreateIncidentCommand> validator) : ControllerBase
{
    private readonly CreateIncidentHandler _handler = handler;
    private readonly IValidator<CreateIncidentCommand> _validator = validator;

    [HttpPost]
    [Authorize(Roles = "Operator,Supervisor")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(CreateIncidentResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ValidationProblemDetails))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateIncidentCommand command)
    {
        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var result = await _handler.HandleAsync(command);
        if (!result.Succeeded)
        {
            ModelState.AddModelError("Error", result.ErrorMessage ?? "Failed to create incident.");
            return ValidationProblem(ModelState);
        }

        var response = result.Response!;
        return CreatedAtAction(null, new { id = response.IncidentId }, response);
    }
}
