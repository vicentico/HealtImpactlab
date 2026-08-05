using MediSync.AI;
using MediSync.Api.Endpoints;
using MediSync.Application;
using MediSync.Infrastructure;
using MediSync.Infrastructure.Seed;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "FrontendDev";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy => policy
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddMediSyncApplication();
builder.Services.AddMediSyncInfrastructure(builder.Configuration);
builder.Services.AddMediSyncAI(builder.Configuration);

var app = builder.Build();

app.UseCors(FrontendCorsPolicy);

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var exception = feature?.Error;

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = exception switch
        {
            InvalidOperationException => StatusCodes.Status400BadRequest,
            FluentValidation.ValidationException => StatusCodes.Status400BadRequest,
            MediSync.AI.AnthropicApiException => StatusCodes.Status502BadGateway,
            _ => StatusCodes.Status500InternalServerError
        };

        await context.Response.WriteAsJsonAsync(new
        {
            error = exception?.GetType().Name,
            message = exception?.Message ?? "Error no manejado."
        });
    });
});

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", service = "MediSync.Api" }));

app.MapPacientesEndpoints();
app.MapInterconsultasEndpoints();
app.MapCasosEndpoints();

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DummyDataSeeder>();
    var dummyDataPath = Path.Combine(AppContext.BaseDirectory, "dummy-data");
    await seeder.SeedAsync(dummyDataPath);
}

app.Run();
