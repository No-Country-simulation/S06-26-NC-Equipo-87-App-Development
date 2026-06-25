using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Technicians.List;

[ApiController]
[Route("api/technicians")]
[Tags("Technicians")]
public class ListTechniciansEndpoint(ListTechniciansHandler handler) : ControllerBase
{
    private readonly ListTechniciansHandler _handler = handler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<TechnicianResponse>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ValidationProblemDetails))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List(
        [FromQuery] int? areaId,
        [FromQuery] int? specialityId,
        [FromQuery] int? incidentTypeId)
    {
        var result = await _handler.HandleAsync(areaId, specialityId, incidentTypeId);
        if (!result.Succeeded)
        {
            ModelState.AddModelError("incidentTypeId", result.ErrorMessage ?? "Invalid incident type.");
            return ValidationProblem(ModelState);
        }

        return Ok(result.Technicians);
    }
}
