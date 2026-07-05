using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Dashboard.GetOperationalDashboard;

[ApiController]
[Route("api/dashboard/operational")]
[Tags("Dashboard")]
public class GetOperationalDashboardEndpoint(GetOperationalDashboardHandler handler) : ControllerBase
{
    private readonly GetOperationalDashboardHandler _handler = handler;

    [HttpGet]
    [Authorize(Roles = "Plant Manager,Supervisor")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(OperationalDashboardResponse))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Get([FromQuery] GetOperationalDashboardQuery query)
    {
        var result = await _handler.HandleAsync(query);
        return Ok(result);
    }
}

public class GetOperationalDashboardQuery
{
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
}
