using api.Data;
using api.Features.Authentication.Common;
using api.Features.Authentication.Login;
using api.Features.Authentication.Register;

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
        services.AddValidatorsFromAssemblyContaining<RegisterCommandValidator>();
        return services;
    }
}
