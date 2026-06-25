namespace api.Features.Technicians.List;

public class TechnicianResponse
{
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int? SpecialityId { get; set; }
    public string SpecialityName { get; set; } = string.Empty;
    public bool IsFree { get; set; }
}
