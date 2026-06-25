using FluentValidation;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Incidents.Assign;

[ApiController]
[Route("api/incidents")]
[Tags("Incidents")]
public class AssignIncidentEndpoint(AssignIncidentHandler handler, IValidator<AssignIncidentCommand> validator) : ControllerBase
{
    private readonly AssignIncidentHandler _handler = handler;
    private readonly IValidator<AssignIncidentCommand> _validator = validator;

    [HttpPost("{incidentId}/assign")]
    [Authorize(Roles = "Supervisor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ValidationProblemDetails))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Assign([FromRoute] string incidentId, [FromBody] AssignIncidentCommand command)
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

        var result = await _handler.HandleAsync(incidentId, command);
        if (!result.Succeeded)
        {
            if (result.ErrorMessage != null && result.ErrorMessage.Contains("not found"))
            {
                return NotFound(new { message = result.ErrorMessage });
            }
            ModelState.AddModelError("Error", result.ErrorMessage ?? "Failed to assign incident.");
            return ValidationProblem(ModelState);
        }

        return Ok(new { message = "Incident assigned successfully." });
    }
}
