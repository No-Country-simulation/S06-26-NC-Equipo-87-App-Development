namespace api.Features.Authentication.Register;

public class RegisterResponse
{
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty;
    public int? AreaId { get; set; }
    public int? ShiftId { get; set; }
}
