using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Incidents.List;

[ApiController]
[Route("api/incidents")]
[Tags("Incidents")]
public class ListIncidentsEndpoint(ListIncidentsHandler handler) : ControllerBase
{
    private readonly ListIncidentsHandler _handler = handler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<IncidentListItemResponse>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List([FromQuery] ListIncidentsQuery query)
    {
        var result = await _handler.HandleAsync(query);
        return Ok(result);
    }
}
