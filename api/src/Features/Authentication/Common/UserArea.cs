using api.Features.Lookups.Common;

namespace api.Features.Authentication.Common;

public class UserArea
{
    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;

    public int AreaId { get; set; }
    public Area Area { get; set; } = null!;
}
