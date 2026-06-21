using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Lookups.IncidentTypes;

[ApiController]
[Route("api/incidents/types")]
[Tags("Lookups")]
public class ListIncidentTypesEndpoint(ListIncidentTypesHandler handler) : ControllerBase
{
    private readonly ListIncidentTypesHandler _handler = handler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<IncidentType>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List()
    {
        List<IncidentType> result = await _handler.HandleAsync();
        return Ok(result);
    }
}
