using api.Features.Authentication.Common;
using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace api.Data.Seed;

public static class DataInitializer
{
    public static async Task SeedAsync(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager,
        IPasswordHasher<User> passwordHasher,
        AppDbContext context)
    {
        await SeedDefaultRolesAsync(roleManager);
        await SeedUsersAsync(userManager, passwordHasher, context);
    }

    private static async Task SeedDefaultRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        string[] roles = { "Operator", "Supervisor", "Technician", "Plant Manager" };
        foreach (string role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                IdentityResult result = await roleManager.CreateAsync(new IdentityRole(role));
                if (!result.Succeeded)
                {
                    string errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to create role {role}: {errors}");
                }
            }
        }
    }

    private static async Task SeedUsersAsync(UserManager<User> userManager, IPasswordHasher<User> passwordHasher, AppDbContext context)
    {
        List<Area> areas = await context.Areas.ToListAsync();
        List<Speciality> specialities = await context.Specialities.ToListAsync();

        Area? zonaNorte = areas.FirstOrDefault(a => a.Name.Equals("Zona Norte", StringComparison.OrdinalIgnoreCase));
        Area? linea3 = areas.FirstOrDefault(a => a.Name.Equals("Línea 3", StringComparison.OrdinalIgnoreCase) || a.Name.Equals("Linea 3", StringComparison.OrdinalIgnoreCase));
        Area? almacen = areas.FirstOrDefault(a => a.Name.Equals("Almacén", StringComparison.OrdinalIgnoreCase) || a.Name.Equals("Almacen", StringComparison.OrdinalIgnoreCase));
        Area? calidadArea = areas.FirstOrDefault(a => a.Name.Equals("Calidad", StringComparison.OrdinalIgnoreCase));

        Speciality? mecanico = specialities.FirstOrDefault(s => s.Name.Equals("Mecanico", StringComparison.OrdinalIgnoreCase) || s.Name.Equals("Mecánico", StringComparison.OrdinalIgnoreCase));
        Speciality? calidadSpeciality = specialities.FirstOrDefault(s => s.Name.Equals("Calidad", StringComparison.OrdinalIgnoreCase));
        Speciality? seguridad = specialities.FirstOrDefault(s => s.Name.Equals("Seguridad", StringComparison.OrdinalIgnoreCase));
        Speciality? general = specialities.FirstOrDefault(s => s.Name.Equals("General", StringComparison.OrdinalIgnoreCase));

        List<(User User, string Role, List<Area> Areas)> seedUsers = new List<(User User, string Role, List<Area> Areas)>
        {
            (new User { FirstName = "Roberto", LastName = "Vazquez", Email = "roberto.vazquez@opscore.com", UserName = "robertovazquez", EmployeeId = "0001" }, "Plant Manager", new List<Area>()),
            (new User { FirstName = "Santiago", LastName = "Mendoza", Email = "santiago.mendoza@opscore.com", UserName = "santiagomendoza", EmployeeId = "0002" }, "Supervisor", new List<Area> { zonaNorte!, linea3! }),
            (new User { FirstName = "Valentina", LastName = "Herrera", Email = "valentina.herrera@opscore.com", UserName = "valentinaherrera", EmployeeId = "0003" }, "Supervisor", new List<Area> { almacen!, calidadArea! }),
            (new User { FirstName = "Mateo", LastName = "Ramírez", Email = "mateo.ramirez@opscore.com", UserName = "mateoramirez", EmployeeId = "0004", SpecialityId = mecanico?.Id }, "Technician", areas),
            (new User { FirstName = "Camila", LastName = "González", Email = "camila.gonzalez@opscore.com", UserName = "camilagonzalez", EmployeeId = "0005", SpecialityId = calidadSpeciality?.Id }, "Technician", areas),
            (new User { FirstName = "Joaquin", LastName = "López", Email = "joaquin.lopez@opscore.com", UserName = "joaquinlopez", EmployeeId = "0006", SpecialityId = seguridad?.Id }, "Technician", areas),
            (new User { FirstName = "Thiago", LastName = "Morales", Email = "thiago.morales@opscore.com", UserName = "thiagomorales", EmployeeId = "0007", SpecialityId = general?.Id }, "Technician", areas),
            (new User { FirstName = "Ana", LastName = "Rosas", Email = "ana.rosas@opscore.com", UserName = "anarosas", EmployeeId = "0008" }, "Operator", new List<Area> { zonaNorte! }),
            (new User { FirstName = "Carlos", LastName = "Torres", Email = "carlos.torres@opscore.com", UserName = "carlostorres", EmployeeId = "0009" }, "Operator", new List<Area> { linea3! }),
            (new User { FirstName = "Maria", LastName = "Mendez", Email = "maria.mendez@opscore.com", UserName = "mariamendez", EmployeeId = "0010" }, "Operator", new List<Area> { almacen! }),
            (new User { FirstName = "Juan", LastName = "Vega", Email = "juan.vega@opscore.com", UserName = "juanvega", EmployeeId = "0011" }, "Operator", new List<Area> { calidadArea! }),
            (new User { FirstName = "Jose", LastName = "Cruz", Email = "jose.cruz@opscore.com", UserName = "josecruz", EmployeeId = "0012" }, "Operator", new List<Area> { zonaNorte! }),
            (new User { FirstName = "Sofia", LastName = "Flores", Email = "sofia.flores@opscore.com", UserName = "sofiaflores", EmployeeId = "0013" }, "Operator", new List<Area> { linea3! }),
            (new User { FirstName = "Luis", LastName = "Soto", Email = "luis.soto@opscore.com", UserName = "luissoto", EmployeeId = "0014" }, "Operator", new List<Area> { almacen! }),
            (new User { FirstName = "Laura", LastName = "Reyes", Email = "laura.reyes@opscore.com", UserName = "laurareyes", EmployeeId = "0015" }, "Operator", new List<Area> { calidadArea! }),
            (new User { FirstName = "Diego", LastName = "Mora", Email = "diego.mora@opscore.com", UserName = "diegomora", EmployeeId = "0016" }, "Operator", new List<Area> { zonaNorte!, linea3! }),
            (new User { FirstName = "Elena", LastName = "Pena", Email = "elena.pena@opscore.com", UserName = "elenapena", EmployeeId = "0017" }, "Operator", new List<Area> { almacen!, calidadArea! })
        };

        foreach ((User User, string Role, List<Area> Areas) seed in seedUsers)
        {
            if (await userManager.Users.AnyAsync(u => u.Email == seed.User.Email))
            {
                continue;
            }

            User user = seed.User;
            user.PinHash = passwordHasher.HashPassword(user, "1234");

            if (seed.Areas != null && seed.Areas.Count > 0)
            {
                user.UserAreas = seed.Areas
                    .Where(a => a != null)
                    .Select(a => new UserArea { AreaId = a.Id })
                    .ToList();
            }

            IdentityResult createResult = await userManager.CreateAsync(user, "Password123!");
            if (!createResult.Succeeded)
            {
                string errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create user {user.UserName}: {errors}");
            }

            IdentityResult roleResult = await userManager.AddToRoleAsync(user, seed.Role);
            if (!roleResult.Succeeded)
            {
                string errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to assign role {seed.Role} to user {user.UserName}: {errors}");
            }
        }
    }
}
