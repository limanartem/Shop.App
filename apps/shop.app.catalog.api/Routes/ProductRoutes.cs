using Shop.App.Catalog.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Shop.App.Catalog
{
  public static class ProductRoutes
  {
    /// <summary>
    /// Configures the routes for the product API.
    /// </summary>
    /// <param name="app">The WebApplication instance.</param>
    public static void Configure(WebApplication app)
    {
      app.MapGet("/products", GetProductsHandler());
      app.MapPost("/products/search", SearchProductsHandler());
      app.MapGet("/productCategories", GetCategoriesHandler());
    }

    private static RequestDelegate GetCategoriesHandler() =>
      async (HttpContext context) =>
      {
        var catalogService = context.RequestServices.GetService<ICatalogService>();
        if (catalogService == null)
        {
          throw new NullReferenceException($"Not able to resolve {typeof(ICatalogService)} from service container");
        }

        var categories = await catalogService.Categories();

        await context.Response.WriteAsJsonAsync(
          categories?
            .Select(category => new
            {
              category.Id,
              Title = category.Name,
              category.ParentCategoryId
            }).ToList()
        );
      };

    private static Func<HttpContext, Guid[], Task> SearchProductsHandler() =>
      async (HttpContext context, Guid[] ids) =>
        {
          try
          {
            var catalogService = context.RequestServices.GetService<ICatalogService>();
            if (catalogService == null)
            {
              throw new NullReferenceException($"Not able to resolve {typeof(ICatalogService)} from service container");
            }

            var products = catalogService.Products(ids);

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
          }
          catch (Exception ex)
          {
            Console.WriteLine(ex.Message);
            throw new Exception("Could not retrieve catalog");
          }
        };

    private static Func<HttpContext, string?, Task> GetProductsHandler() =>
      async (HttpContext context, [FromQuery] string? categoryId) =>
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
      };
  }
}