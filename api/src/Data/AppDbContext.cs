using api.Data.Seed;
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
    public DbSet<UserArea> UserAreas { get; set; } = null!;
    public DbSet<Shift> Shifts { get; set; } = null!;
    public DbSet<IncidentType> IncidentTypes { get; set; } = null!;
    public DbSet<SeverityType> SeverityTypes { get; set; } = null!;
    public DbSet<Incident> Incidents { get; set; } = null!;
    public DbSet<IncidentStatusHistory> IncidentStatusHistories { get; set; } = null!;
    public DbSet<Speciality> Specialities { get; set; } = null!;
    public DbSet<RootCauseType> RootCauseTypes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            entity.HasOne(u => u.Shift)
                  .WithMany()
                  .HasForeignKey(u => u.ShiftId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(u => u.Speciality)
                  .WithMany()
                  .HasForeignKey(u => u.SpecialityId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<UserArea>(entity =>
        {
            entity.ToTable("UserAreas");
            entity.HasKey(ua => new { ua.UserId, ua.AreaId });

            entity.HasOne(ua => ua.User)
                  .WithMany(u => u.UserAreas)
                  .HasForeignKey(ua => ua.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ua => ua.Area)
                  .WithMany()
                  .HasForeignKey(ua => ua.AreaId)
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
        builder.Entity<Speciality>().ToTable("Specialities");
        builder.Entity<RootCauseType>().ToTable("RootCauseTypes");

        builder.Entity<IncidentType>(entity =>
        {
            entity.ToTable("IncidentTypes");
            entity.HasOne(it => it.Speciality)
                  .WithMany()
                  .HasForeignKey(it => it.SpecialityId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

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

            entity.HasOne(i => i.AssignedToUser)
                  .WithMany()
                  .HasForeignKey(i => i.AssignedToUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(i => i.RootCauseType)
                  .WithMany()
                  .HasForeignKey(i => i.RootCauseTypeId)
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

        builder.SeedData();
    }
}
