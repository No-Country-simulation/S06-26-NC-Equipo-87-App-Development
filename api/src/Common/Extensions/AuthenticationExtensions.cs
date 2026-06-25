using System.Text;

using api.Data;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace api.Common.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddAuthenticationServices(this IServiceCollection services, IConfiguration configuration)
    {
        IConfigurationSection jwtSettings = configuration.GetSection("Jwt");
        string secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured.");
        byte[] key = Encoding.UTF8.GetBytes(secret);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    string? accessToken = context.Request.Query["access_token"];
                    Microsoft.AspNetCore.Http.PathString path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/incidents"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                },
                OnTokenValidated = async context =>
                {
                    AppDbContext dbContext = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                    string authorizationHeader = context.HttpContext.Request.Headers.Authorization.ToString();
                    if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    {
                        string tokenString = authorizationHeader.Substring("Bearer ".Length).Trim();
                        bool isRevoked = await dbContext.RevokedTokens.AnyAsync(rt => rt.Token == tokenString);
                        if (isRevoked)
                        {
                            context.Fail("Token has been revoked.");
                        }
                    }
                }
            };
        });

        return services;
    }
}
