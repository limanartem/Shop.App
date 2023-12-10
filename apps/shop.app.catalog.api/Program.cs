using Shop.App.Catalog.Api.Db;
using Shop.App.Catalog.Api.Services;
using Shop.App.Catalog.Api.Interfaces;
using Microsoft.AspNetCore.Diagnostics;
using Shop.App.Catalog;

var builder = WebApplication.CreateBuilder(args);

// Configure CORS policy
builder.Services.AddCors(options =>
{
  options.AddPolicy("myAppCors", policy =>
  {
    policy.WithOrigins("*")
        .AllowAnyHeader()
        .AllowAnyMethod();
  });
});

builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddSingleton<ICatalogService, CatalogService>();
builder.Services.AddSingleton<ICacheService, CacheService>();
builder.Services.AddSingleton<ICacheDatabaseProvider, CacheDbContext>();

// Configure JSON serialization options
builder.Services.ConfigureHttpJsonOptions(options =>
{
  // options.SerializerOptions.MaxDepth = 2;
  // options.SerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
});

builder.Services.AddProblemDetails();

// Configure RouteHandlerOptions to throw on bad request
builder.Services.Configure<RouteHandlerOptions>(options => options.ThrowOnBadRequest = true);

var app = builder.Build();

// Configure global exception handling
app.UseExceptionHandler(exceptionHandlerApp =>
{
  exceptionHandlerApp.Run(async httpContext =>
  {
    Console.WriteLine("Error occurred!");

    var exception = httpContext.Features.Get<IExceptionHandlerFeature>()!.Error;
    Console.WriteLine(exception.ToString());
    await Results.Problem().ExecuteAsync(httpContext);
  });
});

app.UseStatusCodePages();

// Configure product routes
ProductRoutes.Configure(app);

// Apply CORS policy
app.UseCors("myAppCors");

app.Run();

public partial class Program
{ }
