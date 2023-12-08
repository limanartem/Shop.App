using Shop.App.Catalog.Api.Db;
using Shop.App.Catalog.Api.Services;
using Shop.App.Catalog.Api.Interfaces;
using Microsoft.AspNetCore.Diagnostics;
using Shop.App.Catalog;

var builder = WebApplication.CreateBuilder(args);
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
builder.Services.AddScoped<ICatalogService, CatalogService>();
builder.Services.ConfigureHttpJsonOptions(options =>
{
  // options.SerializerOptions.MaxDepth = 2;
  // options.SerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
});
builder.Services.AddProblemDetails();
builder.Services.Configure<RouteHandlerOptions>(options => options.ThrowOnBadRequest = true);


var app = builder.Build();

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

ProductRoutes.Configure(app);

app.UseCors("myAppCors");

app.Run();
