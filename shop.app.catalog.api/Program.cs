using Shop.App.Catalog.Api.Db;
using Microsoft.EntityFrameworkCore;
using Shop.App.Catalog.Api.Services;
using Shop.App.Catalog.Api.Interfaces;
using System.Text.Json.Serialization;

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


var app = builder.Build();

app.MapGet("/products", async (context) =>
{
  await context.Response.WriteAsJsonAsync(
    context.RequestServices
    .GetService<ICatalogService>()?
    .Products()
    .Select(product => new
    {
      product.Id,
      product.Title,
      product.Description,
      product.Price,
      product.Currency,
      product.CategoryId
    }).ToList()
    );
});

app.MapGet("/productCategories", async (context) =>
{
  await context.Response.WriteAsJsonAsync(
    context.RequestServices
    .GetService<ICatalogService>()?
    .Categories()
    .Select(category => new
    {
      category.Id,
      Title = category.Name,
      category.ParentCategoryId
    }).ToList()
    );
});


app.UseCors("myAppCors");
app.Run();
