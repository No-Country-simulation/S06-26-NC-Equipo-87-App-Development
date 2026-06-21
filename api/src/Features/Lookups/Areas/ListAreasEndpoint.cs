using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Lookups.Areas;

[ApiController]
[Route("api/areas")]
[Tags("Lookups")]
public class ListAreasEndpoint(ListAreasHandler handler) : ControllerBase
{
    private readonly ListAreasHandler _handler = handler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Area>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List()
    {
        List<Area> result = await _handler.HandleAsync();
        return Ok(result);
    }
}
