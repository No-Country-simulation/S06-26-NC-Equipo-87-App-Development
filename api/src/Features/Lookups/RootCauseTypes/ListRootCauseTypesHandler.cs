using api.Data;
using api.Features.Lookups.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Lookups.RootCauseTypes;

public class ListRootCauseTypesHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<List<RootCauseType>> HandleAsync()
    {
        return await _dbContext.RootCauseTypes
            .Where(r => r.Status == "Active")
            .ToListAsync();
    }
}
