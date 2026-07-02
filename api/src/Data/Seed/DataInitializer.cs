using api.Features.Authentication.Common;
using api.Features.Incidents.Common;
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
        await SeedIncidentsAsync(context);
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

        List<Shift> shifts = await context.Shifts.ToListAsync();

        Shift? matutino = shifts.FirstOrDefault(s => s.Id == 1);
        Shift? vespertino = shifts.FirstOrDefault(s => s.Id == 2);

        List<(User User, string Role, List<Area> Areas)> seedUsers = new List<(User User, string Role, List<Area> Areas)>
        {
            (new User { FirstName = "Roberto", LastName = "Vazquez", Email = "roberto.vazquez@opscore.com", UserName = "robertovazquez", EmployeeId = "0001" }, "Plant Manager", new List<Area>()),
            (new User { FirstName = "Santiago", LastName = "Mendoza", Email = "santiago.mendoza@opscore.com", UserName = "santiagomendoza", EmployeeId = "0002" }, "Supervisor", new List<Area> { zonaNorte!, linea3! }),
            (new User { FirstName = "Valentina", LastName = "Herrera", Email = "valentina.herrera@opscore.com", UserName = "valentinaherrera", EmployeeId = "0003" }, "Supervisor", new List<Area> { almacen!, calidadArea! }),
            (new User { FirstName = "Mateo", LastName = "Ramírez", Email = "mateo.ramirez@opscore.com", UserName = "mateoramirez", EmployeeId = "0004", SpecialityId = mecanico?.Id }, "Technician", areas),
            (new User { FirstName = "Camila", LastName = "González", Email = "camila.gonzalez@opscore.com", UserName = "camilagonzalez", EmployeeId = "0005", SpecialityId = calidadSpeciality?.Id }, "Technician", areas),
            (new User { FirstName = "Joaquin", LastName = "López", Email = "joaquin.lopez@opscore.com", UserName = "joaquinlopez", EmployeeId = "0006", SpecialityId = seguridad?.Id }, "Technician", areas),
            (new User { FirstName = "Thiago", LastName = "Morales", Email = "thiago.morales@opscore.com", UserName = "thiagomorales", EmployeeId = "0007", SpecialityId = general?.Id }, "Technician", areas),
            (new User { FirstName = "Ana", LastName = "Rosas", Email = "ana.rosas@opscore.com", UserName = "anarosas", EmployeeId = "0008", ShiftId = matutino?.Id }, "Operator", new List<Area> { zonaNorte! }),
            (new User { FirstName = "Carlos", LastName = "Torres", Email = "carlos.torres@opscore.com", UserName = "carlostorres", EmployeeId = "0009", ShiftId = vespertino?.Id }, "Operator", new List<Area> { linea3! }),
            (new User { FirstName = "Maria", LastName = "Mendez", Email = "maria.mendez@opscore.com", UserName = "mariamendez", EmployeeId = "0010", ShiftId = matutino?.Id }, "Operator", new List<Area> { almacen! }),
            (new User { FirstName = "Juan", LastName = "Vega", Email = "juan.vega@opscore.com", UserName = "juanvega", EmployeeId = "0011", ShiftId = vespertino?.Id }, "Operator", new List<Area> { calidadArea! }),
            (new User { FirstName = "Jose", LastName = "Cruz", Email = "jose.cruz@opscore.com", UserName = "josecruz", EmployeeId = "0012", ShiftId = matutino?.Id }, "Operator", new List<Area> { zonaNorte! }),
            (new User { FirstName = "Sofia", LastName = "Flores", Email = "sofia.flores@opscore.com", UserName = "sofiaflores", EmployeeId = "0013", ShiftId = vespertino?.Id }, "Operator", new List<Area> { linea3! }),
            (new User { FirstName = "Luis", LastName = "Soto", Email = "luis.soto@opscore.com", UserName = "luissoto", EmployeeId = "0014", ShiftId = matutino?.Id }, "Operator", new List<Area> { almacen! }),
            (new User { FirstName = "Laura", LastName = "Reyes", Email = "laura.reyes@opscore.com", UserName = "laurareyes", EmployeeId = "0015", ShiftId = vespertino?.Id }, "Operator", new List<Area> { calidadArea! }),
            (new User { FirstName = "Diego", LastName = "Mora", Email = "diego.mora@opscore.com", UserName = "diegomora", EmployeeId = "0016", ShiftId = matutino?.Id }, "Operator", new List<Area> { zonaNorte!, linea3! }),
            (new User { FirstName = "Elena", LastName = "Pena", Email = "elena.pena@opscore.com", UserName = "elenapena", EmployeeId = "0017", ShiftId = vespertino?.Id }, "Operator", new List<Area> { almacen!, calidadArea! })
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

    private static async Task SeedIncidentsAsync(AppDbContext context)
    {
        if (await context.Incidents.AnyAsync())
        {
            return;
        }

        string rosaId = (await context.Users.FirstAsync(u => u.Email == "ana.rosas@opscore.com")).Id;
        string supervisorNorteId = (await context.Users.FirstAsync(u => u.Email == "santiago.mendoza@opscore.com")).Id;
        string supervisorSurId = (await context.Users.FirstAsync(u => u.Email == "valentina.herrera@opscore.com")).Id;

        string techMateoId = (await context.Users.FirstAsync(u => u.Email == "mateo.ramirez@opscore.com")).Id;
        string techCamilaId = (await context.Users.FirstAsync(u => u.Email == "camila.gonzalez@opscore.com")).Id;
        string techJoaquinId = (await context.Users.FirstAsync(u => u.Email == "joaquin.lopez@opscore.com")).Id;
        string techThiagoId = (await context.Users.FirstAsync(u => u.Email == "thiago.morales@opscore.com")).Id;

        string SupervisorFor(int areaId)
        {
            return areaId <= 2 ? supervisorNorteId : supervisorSurId;
        }

        string TechnicianFor(int incidentTypeId)
        {
            return incidentTypeId switch
            {
                1 => techMateoId,
                2 => techJoaquinId,
                3 => techCamilaId,
                _ => techThiagoId,
            };
        }

        string TechnicianNameFor(int incidentTypeId)
        {
            return incidentTypeId switch
            {
                1 => "Mateo Ramírez",
                2 => "Joaquin López",
                3 => "Camila González",
                _ => "Thiago Morales",
            };
        }

        List<User> allOperators = await context.Users
            .Where(u => new[]
            {
                "ana.rosas@opscore.com", "carlos.torres@opscore.com", "maria.mendez@opscore.com",
                "juan.vega@opscore.com", "jose.cruz@opscore.com", "sofia.flores@opscore.com",
                "luis.soto@opscore.com", "laura.reyes@opscore.com", "diego.mora@opscore.com",
                "elena.pena@opscore.com"
            }.Contains(u.Email!))
            .ToListAsync();

        User FindOperator(string email)
        {
            return allOperators.First(u => u.Email == email);
        }

        string[] descriptions =
        [
            "Falla en sensor de temperatura del equipo principal",
            "Accidente leve durante maniobra de carga",
            "Producto fuera de especificación detectado en línea",
            "Derrame de aceite hidráulico en piso de planta",
            "Vibración inusual en motor de banda transportadora",
            "Cortocircuito en tablero eléctrico secundario",
            "Fuga de vapor en tubería de distribución",
            "Material defectuoso recibido de proveedor",
            "Parada no programada de compresor de aire",
            "Rotura de sello mecánico en bomba centrífuga",
            "Caída de operario en zona húmeda",
            "Rechazo de lote por contaminación cruzada",
            "Sobrecalentamiento en variador de frecuencia",
            "Obstrucción en ducto de ventilación forzada",
            "Falla en sistema de pesaje automático",
            "Desgaste prematuro en rodamiento de eje",
            "Error en etiquetado de producto terminado",
            "Incidente de seguridad por EPP incompleto",
        ];

        string[] solutions =
        [
            "Se reemplazó el sensor y se calibró el sistema",
            "Se brindó atención médica y se reforzó protocolo de seguridad",
            "Se segregó el lote afectado y se notificó a calidad",
            "Se contuvo el derrame y se realizó limpieza según procedimiento",
            "Se reemplazó el rodamiento y se alineó el eje",
            "Se revisó y restauró el circuito eléctrico afectado",
            "Se reparó la junta y se realizó prueba hidrostática",
            "Se devolvió el material y se levantó no conformidad al proveedor",
            "Se diagnosticó falla en válvula de admisión y se reemplazó",
        ];

        int[] incidentTypeIds = [1, 2, 3, 4];
        int[] severityTypeIds = [1, 2, 3];
        int[] rootCauseTypeIds = [1, 2, 3, 4, 5];

        (User Op, int[] AreaIds, int Count)[] plans =
        [
            (FindOperator("ana.rosas@opscore.com"),    [1],    8),
            (FindOperator("carlos.torres@opscore.com"), [2],    5),
            (FindOperator("maria.mendez@opscore.com"),  [3],    5),
            (FindOperator("juan.vega@opscore.com"),     [4],    6),
            (FindOperator("jose.cruz@opscore.com"),     [1],    5),
            (FindOperator("sofia.flores@opscore.com"),  [2],    4),
            (FindOperator("luis.soto@opscore.com"),     [3],    4),
            (FindOperator("laura.reyes@opscore.com"),   [4],    4),
            (FindOperator("diego.mora@opscore.com"),    [1, 2], 3),
            (FindOperator("elena.pena@opscore.com"),    [3, 4], 3),
        ];

        List<Incident> incidents = [];
        List<IncidentStatusHistory> histories = [];

        int incidentNumber = 1;
        int historyId = 1;

        DateTimeOffset At(int daysAgo, int hour)
        {
            return new DateTimeOffset(DateTimeOffset.UtcNow.Date.AddDays(-daysAgo).AddHours(hour), TimeSpan.Zero);
        }

        string NextId()
        {
            return $"INC-{incidentNumber++:D4}";
        }

        void AppendOpen(string incidentId, string operatorId, DateTimeOffset at)
        {
            histories.Add(new IncidentStatusHistory
            {
                IncidentId = incidentId,
                PreviousStatus = null,
                NewStatus = "Open",
                TransitionNotes = "Reporte inicial del operador",
                ChangedByUserId = operatorId,
                ChangedDate = at,
            });
        }

        void AppendAssigned(string incidentId, int areaId, int incidentTypeId, DateTimeOffset at)
        {
            histories.Add(new IncidentStatusHistory
            {
                IncidentId = incidentId,
                PreviousStatus = "Open",
                NewStatus = "Assigned",
                TransitionNotes = $"Técnico asignado: {TechnicianNameFor(incidentTypeId)}",
                ChangedByUserId = SupervisorFor(areaId),
                ChangedDate = at,
            });
        }

        void AppendInProgress(string incidentId, int incidentTypeId, DateTimeOffset at)
        {
            histories.Add(new IncidentStatusHistory
            {
                IncidentId = incidentId,
                PreviousStatus = "Assigned",
                NewStatus = "In-Progress",
                TransitionNotes = "Atención iniciada por el técnico",
                ChangedByUserId = TechnicianFor(incidentTypeId),
                ChangedDate = at,
            });
        }

        void AppendClosed(string incidentId, int incidentTypeId, string solution, DateTimeOffset at)
        {
            histories.Add(new IncidentStatusHistory
            {
                IncidentId = incidentId,
                PreviousStatus = "In-Progress",
                NewStatus = "Closed",
                TransitionNotes = $"Solución: {solution}",
                ChangedByUserId = TechnicianFor(incidentTypeId),
                ChangedDate = at,
            });
        }

        string openId = NextId();
        incidents.Add(new Incident
        {
            IncidentId = openId,
            Description = descriptions[0],
            AreaId = 1,
            IncidentTypeId = 1,
            SeverityTypeId = 2,
            Status = "Open",
        });
        AppendOpen(openId, rosaId, At(1, 8));

        string assignedId = NextId();
        incidents.Add(new Incident
        {
            IncidentId = assignedId,
            Description = descriptions[1],
            AreaId = 1,
            IncidentTypeId = 2,
            SeverityTypeId = 1,
            Status = "Assigned",
            AssignedToUserId = TechnicianFor(2),
        });
        AppendOpen(assignedId, rosaId, At(2, 7));
        AppendAssigned(assignedId, 1, 2, At(2, 9));

        string inProgressId = NextId();
        incidents.Add(new Incident
        {
            IncidentId = inProgressId,
            Description = descriptions[2],
            AreaId = 1,
            IncidentTypeId = 3,
            SeverityTypeId = 1,
            Status = "In-Progress",
            AssignedToUserId = TechnicianFor(3),
        });
        AppendOpen(inProgressId, rosaId, At(3, 6));
        AppendAssigned(inProgressId, 1, 3, At(3, 8));
        AppendInProgress(inProgressId, 3, At(3, 10));

        int globalIndex = 0;

        foreach ((User op, int[] areaIds, int count) in plans)
        {
            int showcaseOffset = op.Id == rosaId ? 3 : 0;
            int remaining = count - showcaseOffset;

            for (int i = 0; i < remaining; i++)
            {
                string incidentId = NextId();
                int areaId = areaIds[i % areaIds.Length];
                int incidentTypeId = incidentTypeIds[globalIndex % incidentTypeIds.Length];
                int severityTypeId = severityTypeIds[globalIndex % severityTypeIds.Length];
                string description = descriptions[(3 + globalIndex) % descriptions.Length];
                string solution = solutions[globalIndex % solutions.Length];
                int rootCauseId = rootCauseTypeIds[globalIndex % rootCauseTypeIds.Length];
                int daysAgo = 4 + globalIndex % 27;
                int hour = 6 + globalIndex % 12;

                DateTimeOffset openedAt = At(daysAgo, hour);
                DateTimeOffset assignedAt = openedAt.AddHours(1);
                DateTimeOffset inProgressAt = openedAt.AddHours(2);
                DateTimeOffset closedAt = openedAt.AddHours(4 + i % 6);

                incidents.Add(new Incident
                {
                    IncidentId = incidentId,
                    Description = description,
                    AreaId = areaId,
                    IncidentTypeId = incidentTypeId,
                    SeverityTypeId = severityTypeId,
                    Status = "Closed",
                    AssignedToUserId = TechnicianFor(incidentTypeId),
                    SolutionApplied = solution,
                    RootCauseTypeId = rootCauseId,
                });

                AppendOpen(incidentId, op.Id, openedAt);
                AppendAssigned(incidentId, areaId, incidentTypeId, assignedAt);
                AppendInProgress(incidentId, incidentTypeId, inProgressAt);
                AppendClosed(incidentId, incidentTypeId, solution, closedAt);

                globalIndex++;
            }
        }

        context.Incidents.AddRange(incidents);
        context.IncidentStatusHistories.AddRange(histories);
        await context.SaveChangesAsync();
    }
}
