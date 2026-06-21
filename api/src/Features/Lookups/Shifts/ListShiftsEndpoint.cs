using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Lookups.Shifts;

[ApiController]
[Route("api/shifts")]
[Tags("Lookups")]
public class ListShiftsEndpoint(ListShiftsHandler handler) : ControllerBase
{
    private readonly ListShiftsHandler _handler = handler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Shift>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> List()
    {
        List<Shift> result = await _handler.HandleAsync();
        return Ok(result);
    }
}
