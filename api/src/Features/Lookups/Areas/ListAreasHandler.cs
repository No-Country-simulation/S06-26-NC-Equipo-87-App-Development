using api.Data;
using api.Features.Lookups.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Lookups.Areas;

public class ListAreasHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<List<Area>> HandleAsync()
    {
        return await _dbContext.Areas.ToListAsync();
    }
}
