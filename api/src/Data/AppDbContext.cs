using api.Features.Authentication.Common;
using api.Features.Incidents.Common;
using api.Features.Lookups.Common;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<User>(options)
{
    public DbSet<RevokedToken> RevokedTokens { get; set; } = null!;
    public DbSet<Area> Areas { get; set; } = null!;
    public DbSet<Shift> Shifts { get; set; } = null!;
    public DbSet<IncidentType> IncidentTypes { get; set; } = null!;
    public DbSet<SeverityType> SeverityTypes { get; set; } = null!;
    public DbSet<Incident> Incidents { get; set; } = null!;
    public DbSet<IncidentStatusHistory> IncidentStatusHistories { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            entity.HasOne(u => u.Area)
                  .WithMany()
                  .HasForeignKey(u => u.AreaId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(u => u.Shift)
                  .WithMany()
                  .HasForeignKey(u => u.ShiftId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
        builder.Entity<IdentityRole>().ToTable("Roles");
        builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");
        builder.Entity<RevokedToken>().ToTable("RevokedTokens");

        builder.Entity<Area>().ToTable("Areas");
        builder.Entity<Shift>().ToTable("Shifts");
        builder.Entity<IncidentType>().ToTable("IncidentTypes");
        builder.Entity<SeverityType>().ToTable("SeverityTypes");

        builder.Entity<Incident>(entity =>
        {
            entity.ToTable("Incidents");
            entity.HasKey(i => i.IncidentId);
            entity.Property(i => i.IncidentId).ValueGeneratedNever();

            entity.HasOne(i => i.Area)
                  .WithMany()
                  .HasForeignKey(i => i.AreaId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(i => i.IncidentType)
                  .WithMany()
                  .HasForeignKey(i => i.IncidentTypeId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(i => i.SeverityType)
                  .WithMany()
                  .HasForeignKey(i => i.SeverityTypeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<IncidentStatusHistory>(entity =>
        {
            entity.ToTable("IncidentStatusHistories");
            entity.HasKey(h => h.HistoryId);

            entity.HasOne(h => h.Incident)
                  .WithMany(i => i.StatusHistories)
                  .HasForeignKey(h => h.IncidentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(h => h.ChangedByUser)
                  .WithMany()
                  .HasForeignKey(h => h.ChangedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Area>().HasData(
            new Area { Id = 1, Name = "Zona Norte", Status = "Active" },
            new Area { Id = 2, Name = "Línea 3", Status = "Active" },
            new Area { Id = 3, Name = "Almacén", Status = "Active" },
            new Area { Id = 4, Name = "Calidad", Status = "Active" }
        );

        builder.Entity<IncidentType>().HasData(
            new IncidentType { Id = 1, Name = "Falla mecánica", Status = "Active" },
            new IncidentType { Id = 2, Name = "Accidente", Status = "Active" },
            new IncidentType { Id = 3, Name = "Calidad", Status = "Active" },
            new IncidentType { Id = 4, Name = "Otro", Status = "Active" }
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
    }
}
