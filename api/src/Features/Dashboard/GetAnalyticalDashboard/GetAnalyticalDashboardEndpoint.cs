using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Features.Dashboard.GetAnalyticalDashboard;

[ApiController]
[Route("api/dashboard/analytical")]
[Tags("Dashboard")]
public class GetAnalyticalDashboardEndpoint(GetAnalyticalDashboardHandler handler) : ControllerBase
{
    private readonly GetAnalyticalDashboardHandler _handler = handler;

    [HttpGet]
    [Authorize(Roles = "Plant Manager,Supervisor")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AnalyticalDashboardResponse))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Get([FromQuery] GetAnalyticalDashboardQuery query)
    {
        var result = await _handler.HandleAsync(query);
        return Ok(result);
    }
}

public class GetAnalyticalDashboardQuery
{
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public string? Area { get; set; }
}
