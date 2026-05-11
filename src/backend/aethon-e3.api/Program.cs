using System.Text.Json.Serialization;
using aethon_e3.core.ApplicationServices;
using aethon_e3.core.DomainServices;
using aethon_e3.core.Projections;
using aethon_e3.persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<GameFactory>();
builder.Services.AddSingleton<BuildService>();
builder.Services.AddSingleton<PopulationGrowthService>();
builder.Services.AddSingleton<RoundService>();
builder.Services.AddSingleton<ResourceGainService>();
builder.Services.AddSingleton<UiStateProjectionService>();
builder.Services.AddScoped<GameApplicationService>();

builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Needed so AddOpenApi() picks up the string enum converter for schema generation
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();

app.MapOpenApi();

app.UseCors();
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok());
app.MapControllers();

app.Run();
