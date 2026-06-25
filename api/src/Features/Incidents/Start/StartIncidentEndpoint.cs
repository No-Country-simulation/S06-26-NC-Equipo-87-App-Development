using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Incidents.Start;

[ApiController]
[Route("api/incidents")]
[Tags("Incidents")]
public class StartIncidentEndpoint(StartIncidentHandler handler) : ControllerBase
{
    private readonly StartIncidentHandler _handler = handler;

    [HttpPost("{incidentId}/start")]
    [Authorize(Roles = "Technician")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Start([FromRoute] string incidentId)
    {
        var result = await _handler.HandleAsync(incidentId);
        if (!result.Succeeded)
        {
            if (result.ErrorMessage != null && result.ErrorMessage.Contains("not found"))
            {
                return NotFound(new { message = result.ErrorMessage });
            }
            ModelState.AddModelError("Error", result.ErrorMessage ?? "Failed to start incident attention.");
            return ValidationProblem(ModelState);
        }

        return Ok(new { message = "Incident attention started successfully." });
    }
}
