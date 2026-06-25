namespace api.Features.Authentication.Register;

public class RegisterCommand
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public List<int> AreaIds { get; set; } = new();

    public int? ShiftId { get; set; }

    public int? SpecialityId { get; set; }
}
