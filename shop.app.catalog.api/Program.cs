using Shop.App.Catalog.Api.Db;
using Microsoft.EntityFrameworkCore;
using Shop.App.Catalog.Api.Services;
using Shop.App.Catalog.Api.Interfaces;
using System.Text.Json.Serialization;
using Shop.App.Catalog.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

app.MapGet("/products", async (HttpContext context, [FromQuery] string? categoryId) =>
{
  var service = context.RequestServices.GetService<ICatalogService>()
  ?? throw new NullReferenceException($"Not able to resolve {typeof(ICatalogService)} from service container");

  var products = string.IsNullOrEmpty(categoryId)
  ? service.Products()
  : await service.Products(int.Parse(categoryId));

  await context.Response.WriteAsJsonAsync(
    products?
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

app.MapPost("/products/search", async (HttpContext context, Guid[] ids) =>
{
  await context.Response.WriteAsJsonAsync(
    context.RequestServices
    .GetService<ICatalogService>()?
    .Products(ids)
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
