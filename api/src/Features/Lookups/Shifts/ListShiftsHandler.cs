using api.Data;
using api.Features.Lookups.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Features.Lookups.Shifts;

public class ListShiftsHandler(AppDbContext dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<List<Shift>> HandleAsync()
    {
        return await _dbContext.Shifts.ToListAsync();
    }
}
