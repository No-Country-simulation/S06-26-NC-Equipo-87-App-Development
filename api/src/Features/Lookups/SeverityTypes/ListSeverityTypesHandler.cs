using api.Data;
using api.Features.Lookups.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Lookups.SeverityTypes;

public class ListSeverityTypesHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<List<SeverityType>> HandleAsync()
    {
        return await _dbContext.SeverityTypes.ToListAsync();
    }
}
