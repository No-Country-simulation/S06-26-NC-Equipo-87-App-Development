using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Identity;

namespace api.Features.Authentication.Common;

public class User : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string PinHash { get; set; } = string.Empty;
    public ICollection<UserArea> UserAreas { get; set; } = new List<UserArea>();
    public int? ShiftId { get; set; }
    public Shift? Shift { get; set; }
    public int? SpecialityId { get; set; }
    public Speciality? Speciality { get; set; }
}
