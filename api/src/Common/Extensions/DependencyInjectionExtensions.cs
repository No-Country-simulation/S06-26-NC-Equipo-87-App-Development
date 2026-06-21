using api.Data;
using api.Features.Authentication.Common;
using api.Features.Authentication.Login;
using api.Features.Authentication.Register;
using api.Features.Incidents.Create;
using api.Features.Incidents.Detail;
using api.Features.Incidents.List;
using api.Features.Lookups.Areas;
using api.Features.Lookups.IncidentTypes;
using api.Features.Lookups.SeverityTypes;
using api.Features.Lookups.Shifts;

using FluentValidation;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace api.Common.Extensions;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddApiInfrastructure()
            .AddDatabaseServices(configuration)
            .AddIdentityServices()
            .AddAuthenticationServices(configuration)
            .AddFeatureServices();

        return services;
    }

    private static IServiceCollection AddApiInfrastructure(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddCustomOpenApi();
        services.AddHealthChecks();
        services.AddCors();
        services.AddHttpContextAccessor();
        return services;
    }

    private static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        return services;
    }

    private static IServiceCollection AddIdentityServices(this IServiceCollection services)
    {
        services.AddIdentity<User, IdentityRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 6;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();
        return services;
    }

    private static IServiceCollection AddFeatureServices(this IServiceCollection services)
    {
        services.AddScoped<RegisterHandler>();
        services.AddScoped<LoginHandler>();
        services.AddScoped<CreateIncidentHandler>();
        services.AddScoped<ListIncidentsHandler>();
        services.AddScoped<GetIncidentDetailHandler>();
        services.AddScoped<ListAreasHandler>();
        services.AddScoped<ListIncidentTypesHandler>();
        services.AddScoped<ListSeverityTypesHandler>();
        services.AddScoped<ListShiftsHandler>();
        services.AddValidatorsFromAssemblyContaining<RegisterCommandValidator>();
        return services;
    }
}
