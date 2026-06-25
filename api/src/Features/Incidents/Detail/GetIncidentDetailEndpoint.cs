using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Incidents.Detail;

[ApiController]
[Route("api/incidents")]
[Tags("Incidents")]
public class GetIncidentDetailEndpoint(GetIncidentDetailHandler handler) : ControllerBase
{
    private readonly GetIncidentDetailHandler _handler = handler;

    [HttpGet("{incidentId}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IncidentDetailResponse))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Get([FromRoute] string incidentId)
    {
        IncidentDetailResponse? result = await _handler.HandleAsync(incidentId);
        return result == null ? NotFound() : Ok(result);
    }
}
