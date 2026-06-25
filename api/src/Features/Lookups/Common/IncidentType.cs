namespace api.Features.Lookups.Common;

public class IncidentType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public int SpecialityId { get; set; }
    public Speciality Speciality { get; set; } = null!;
}
