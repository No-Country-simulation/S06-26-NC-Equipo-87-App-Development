using api.Common.Extensions;
using api.Data;

using Microsoft.AspNetCore.HttpOverrides;

using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
    KnownIPNetworks = { },
    KnownProxies = { }
});

app.UseCors(options => options
    .SetIsOriginAllowed(origin => true)
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
}

// if (app.Environment.IsDevelopment())
// {
app.MapOpenApi();
app.MapScalarApiReference();
// }

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<api.Features.Incidents.Common.IncidentHub>("/hubs/incidents");
app.MapHealthChecks("/health");
app.Map("/error", () => Results.Problem());

await DatabaseInitializer.InitializeAsync(app.Services);

app.Run();

public partial class Program { }
