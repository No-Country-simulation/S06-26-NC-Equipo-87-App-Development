using api.Data;
using api.Features.Lookups.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Lookups.Specialities;

public class ListSpecialitiesHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<List<Speciality>> HandleAsync()
    {
        return await _dbContext.Specialities
            .Where(s => s.Status == "Active")
            .ToListAsync();
    }
}
