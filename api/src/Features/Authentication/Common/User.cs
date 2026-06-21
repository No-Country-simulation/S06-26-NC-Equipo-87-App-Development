using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Identity;

namespace api.Features.Authentication.Common;

public class User : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string PinHash { get; set; } = string.Empty;
    public int? AreaId { get; set; }
    public Area? Area { get; set; }
    public int? ShiftId { get; set; }
    public Shift? Shift { get; set; }
}
