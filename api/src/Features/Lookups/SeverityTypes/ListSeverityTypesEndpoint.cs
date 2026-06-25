using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Lookups.SeverityTypes;

[ApiController]
[Route("api/incidents/severities")]
[Tags("Lookups")]
public class ListSeverityTypesEndpoint(ListSeverityTypesHandler handler) : ControllerBase
{
    private readonly ListSeverityTypesHandler _handler = handler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SeverityType>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List()
    {
        List<SeverityType> result = await _handler.HandleAsync();
        return Ok(result);
    }
}
