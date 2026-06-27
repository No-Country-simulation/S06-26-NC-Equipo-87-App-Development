using api.Features.Lookups.Common;

using Microsoft.EntityFrameworkCore;

namespace api.Data.Seed;

public static class ModelBuilderExtensions
{
    public static void SeedData(this ModelBuilder builder)
    {
        builder.Entity<Area>().HasData(
            new Area { Id = 1, Name = "Zona Norte", Status = "Active" },
            new Area { Id = 2, Name = "Línea 3", Status = "Active" },
            new Area { Id = 3, Name = "Almacén", Status = "Active" },
            new Area { Id = 4, Name = "Calidad", Status = "Active" }
        );

        builder.Entity<Speciality>().HasData(
            new Speciality { Id = 1, Name = "Mecanico", Status = "Active" },
            new Speciality { Id = 2, Name = "Calidad", Status = "Active" },
            new Speciality { Id = 3, Name = "Seguridad", Status = "Active" },
            new Speciality { Id = 4, Name = "General", Status = "Active" }
        );

        builder.Entity<IncidentType>().HasData(
            new IncidentType { Id = 1, Name = "Falla mecánica", Status = "Active", SpecialityId = 1 },
            new IncidentType { Id = 2, Name = "Accidente", Status = "Active", SpecialityId = 3 },
            new IncidentType { Id = 3, Name = "Calidad", Status = "Active", SpecialityId = 2 },
            new IncidentType { Id = 4, Name = "Otro", Status = "Active", SpecialityId = 4 }
        );

        builder.Entity<SeverityType>().HasData(
            new SeverityType { Id = 1, Name = "Alto", Status = "Active" },
            new SeverityType { Id = 2, Name = "Medio", Status = "Active" },
            new SeverityType { Id = 3, Name = "Bajo", Status = "Active" }
        );

        builder.Entity<Shift>().HasData(
            new Shift { Id = 1, Name = "Turno mañana", Status = "Active" },
            new Shift { Id = 2, Name = "Turno tarde", Status = "Active" },
            new Shift { Id = 3, Name = "Turno nocturno", Status = "Active" }
        );

        builder.Entity<RootCauseType>().HasData(
            new RootCauseType { Id = 1, Name = "Error de operación", Status = "Active" },
            new RootCauseType { Id = 2, Name = "Falla o desgaste de componente", Status = "Active" },
            new RootCauseType { Id = 3, Name = "Material o insumo defectuoso", Status = "Active" },
            new RootCauseType { Id = 4, Name = "Condición del área", Status = "Active" },
            new RootCauseType { Id = 5, Name = "Causa no determinada", Status = "Active" }
        );
    }
}
