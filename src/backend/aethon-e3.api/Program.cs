using System.Text.Json.Serialization;
using aethon_e3.core.ApplicationServices;
using aethon_e3.core.DomainServices;
using aethon_e3.core.Projections;
using aethon_e3.persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("aethon-e3"));

builder.Services.AddSingleton<GameFactory>();
builder.Services.AddSingleton<BuildService>();
builder.Services.AddSingleton<RoundService>();
builder.Services.AddSingleton<UiStateProjectionService>();
builder.Services.AddScoped<GameApplicationService>();

builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
