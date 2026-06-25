using api.Data;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Technicians.List;

public class ListTechniciansResult
{
    public bool Succeeded { get; set; }
    public string? ErrorMessage { get; set; }
    public List<TechnicianResponse>? Technicians { get; set; }
}

public class ListTechniciansHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<ListTechniciansResult> HandleAsync(int? areaId, int? specialityId, int? incidentTypeId)
    {
        int? targetSpecialityId = null;

        if (incidentTypeId.HasValue)
        {
            var incidentType = await _dbContext.IncidentTypes
                .FirstOrDefaultAsync(it => it.Id == incidentTypeId.Value);

            if (incidentType == null)
            {
                return new ListTechniciansResult
                {
                    Succeeded = false,
                    ErrorMessage = $"Incident type with ID {incidentTypeId.Value} does not exist."
                };
            }

            targetSpecialityId = incidentType.SpecialityId;
        }

        var query = from user in _dbContext.Users
                    join userRole in _dbContext.UserRoles on user.Id equals userRole.UserId
                    join role in _dbContext.Roles on userRole.RoleId equals role.Id
                    where role.Name == "Technician"
                    select new
                    {
                        User = user,
                        user.Speciality,
                        IsFree = !_dbContext.Incidents.Any(i => i.AssignedToUserId == user.Id && i.Status != "Closed")
                    };

        if (areaId.HasValue)
        {
            query = query.Where(x => x.User.UserAreas.Any(ua => ua.AreaId == areaId.Value));
        }

        if (specialityId.HasValue)
        {
            query = query.Where(x => x.User.SpecialityId == specialityId.Value);
        }

        if (targetSpecialityId.HasValue)
        {
            query = query.Where(x => x.User.SpecialityId == targetSpecialityId.Value);
        }

        var results = await query
            .Select(x => new TechnicianResponse
            {
                UserId = x.User.Id,
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                SpecialityId = x.User.SpecialityId,
                SpecialityName = x.Speciality != null ? x.Speciality.Name : string.Empty,
                IsFree = x.IsFree
            })
            .ToListAsync();

        return new ListTechniciansResult
        {
            Succeeded = true,
            Technicians = results
        };
    }
}
