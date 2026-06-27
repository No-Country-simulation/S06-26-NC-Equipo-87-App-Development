using FluentValidation;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Incidents.Edit;

[ApiController]
[Route("api/incidents")]
[Tags("Incidents")]
public class EditIncidentEndpoint(EditIncidentHandler handler, IValidator<EditIncidentCommand> validator) : ControllerBase
{
    private readonly EditIncidentHandler _handler = handler;
    private readonly IValidator<EditIncidentCommand> _validator = validator;

    [HttpPut("{incidentId}")]
    [Authorize(Roles = "Operator,Supervisor")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(EditIncidentResponse))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ValidationProblemDetails))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Edit([FromRoute] string incidentId, [FromBody] EditIncidentCommand command)
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
            ModelState.AddModelError("Error", result.ErrorMessage ?? "Failed to edit incident.");
            return ValidationProblem(ModelState);
        }

        return Ok(result.Response);
    }
}
