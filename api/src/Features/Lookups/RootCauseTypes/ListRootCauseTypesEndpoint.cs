using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Lookups.RootCauseTypes;

[ApiController]
[Route("api/incidents/root-cause-types")]
[Tags("Lookups")]
public class ListRootCauseTypesEndpoint(ListRootCauseTypesHandler handler) : ControllerBase
{
    private readonly ListRootCauseTypesHandler _handler = handler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<RootCauseType>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List()
    {
        List<RootCauseType> result = await _handler.HandleAsync();
        return Ok(result);
    }
}
