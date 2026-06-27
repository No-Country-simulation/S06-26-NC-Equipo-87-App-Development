using FluentValidation;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Incidents.Close;

[ApiController]
[Route("api/incidents")]
[Tags("Incidents")]
public class CloseIncidentEndpoint(CloseIncidentHandler handler, IValidator<CloseIncidentCommand> validator) : ControllerBase
{
    private readonly CloseIncidentHandler _handler = handler;
    private readonly IValidator<CloseIncidentCommand> _validator = validator;

    [HttpPost("{incidentId}/close")]
    [Authorize(Roles = "Technician")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Close([FromRoute] string incidentId, [FromBody] CloseIncidentCommand command)
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
            ModelState.AddModelError("Error", result.ErrorMessage ?? "Failed to close incident.");
            return ValidationProblem(ModelState);
        }

        return Ok(new { message = "Incident closed successfully." });
    }
}
