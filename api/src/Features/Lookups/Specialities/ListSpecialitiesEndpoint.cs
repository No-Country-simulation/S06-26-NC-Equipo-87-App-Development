using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Lookups.Specialities;

[ApiController]
[Route("api/specialities")]
[Tags("Lookups")]
public class ListSpecialitiesEndpoint(ListSpecialitiesHandler handler) : ControllerBase
{
    private readonly ListSpecialitiesHandler _handler = handler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Speciality>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List()
    {
        List<Speciality> result = await _handler.HandleAsync();
        return Ok(result);
    }
}
