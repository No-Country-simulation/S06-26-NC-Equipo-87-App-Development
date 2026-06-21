using api.Data;
using api.Features.Lookups.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Lookups.IncidentTypes;

public class ListIncidentTypesHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<List<IncidentType>> HandleAsync()
    {
        return await _dbContext.IncidentTypes.ToListAsync();
    }
}
