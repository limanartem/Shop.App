using Shop.App.Catalog.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shop.App.Catalog.Api.Models;
using Shop.App.Catalog.Api.Auth;

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
      // Public routes
      app.MapGet("/products", GetProductsHandler());
      app.MapPost("/products/search", SearchProductsHandler());
      app.MapGet("/productCategories", GetCategoriesHandler());
      
      // Admin routes - protected with authentication
      app.MapGet("/api/products", GetProductsHandler())
        .WithMetadata(new AdminAuthorizeAttribute());
        
      app.MapGet("/api/products/{id}", GetProductByIdHandler())
        .WithMetadata(new AdminAuthorizeAttribute());
        
      app.MapPost("/api/products", CreateProductHandler())
        .WithMetadata(new AdminAuthorizeAttribute());
        
      app.MapPut("/api/products/{id}", UpdateProductHandler())
        .WithMetadata(new AdminAuthorizeAttribute());
        
      app.MapDelete("/api/products/{id}", DeleteProductHandler())
        .WithMetadata(new AdminAuthorizeAttribute());
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
            })
        );
      };
      
    // Admin API handlers
    
    private static RequestDelegate GetProductByIdHandler() =>
      async (HttpContext context) =>
      {
        if (!Guid.TryParse(context.Request.RouteValues["id"]?.ToString(), out var productId))
        {
          context.Response.StatusCode = StatusCodes.Status400BadRequest;
          await context.Response.WriteAsJsonAsync(new { message = "Invalid product ID format" });
          return;
        }
        
        var catalogService = context.RequestServices.GetService<ICatalogService>();
        if (catalogService == null)
        {
          throw new NullReferenceException($"Not able to resolve {typeof(ICatalogService)} from service container");
        }

        var product = await catalogService.GetProductByIdAsync(productId);
        
        if (product == null)
        {
          context.Response.StatusCode = StatusCodes.Status404NotFound;
          await context.Response.WriteAsJsonAsync(new { message = "Product not found" });
          return;
        }

        await context.Response.WriteAsJsonAsync(product);
      };
      
    private static RequestDelegate CreateProductHandler() =>
      async (HttpContext context) =>
      {
        try
        {
          var catalogService = context.RequestServices.GetService<ICatalogService>();
          if (catalogService == null)
          {
            throw new NullReferenceException($"Not able to resolve {typeof(ICatalogService)} from service container");
          }
          
          var productData = await context.Request.ReadFromJsonAsync<Product>();
          if (productData == null)
          {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { message = "Invalid product data" });
            return;
          }
          
          var createdProduct = await catalogService.CreateProductAsync(productData);
          
          context.Response.StatusCode = StatusCodes.Status201Created;
          await context.Response.WriteAsJsonAsync(createdProduct);
        }
        catch (Exception ex)
        {
          context.Response.StatusCode = StatusCodes.Status500InternalServerError;
          await context.Response.WriteAsJsonAsync(new { message = $"Error creating product: {ex.Message}" });
        }
      };
      
    private static RequestDelegate UpdateProductHandler() =>
      async (HttpContext context) =>
      {
        try
        {
          if (!Guid.TryParse(context.Request.RouteValues["id"]?.ToString(), out var productId))
          {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { message = "Invalid product ID format" });
            return;
          }
          
          var catalogService = context.RequestServices.GetService<ICatalogService>();
          if (catalogService == null)
          {
            throw new NullReferenceException($"Not able to resolve {typeof(ICatalogService)} from service container");
          }
          
          var productData = await context.Request.ReadFromJsonAsync<Product>();
          if (productData == null)
          {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { message = "Invalid product data" });
            return;
          }
          
          var updatedProduct = await catalogService.UpdateProductAsync(productId, productData);
          
          if (updatedProduct == null)
          {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new { message = "Product not found" });
            return;
          }
          
          await context.Response.WriteAsJsonAsync(updatedProduct);
        }
        catch (Exception ex)
        {
          context.Response.StatusCode = StatusCodes.Status500InternalServerError;
          await context.Response.WriteAsJsonAsync(new { message = $"Error updating product: {ex.Message}" });
        }
      };
      
    private static RequestDelegate DeleteProductHandler() =>
      async (HttpContext context) =>
      {
        try
        {
          if (!Guid.TryParse(context.Request.RouteValues["id"]?.ToString(), out var productId))
          {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { message = "Invalid product ID format" });
            return;
          }
          
          var catalogService = context.RequestServices.GetService<ICatalogService>();
          if (catalogService == null)
          {
            throw new NullReferenceException($"Not able to resolve {typeof(ICatalogService)} from service container");
          }
          
          var result = await catalogService.DeleteProductAsync(productId);
          
          if (!result)
          {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new { message = "Product not found" });
            return;
          }
          
          context.Response.StatusCode = StatusCodes.Status204NoContent;
        }
        catch (Exception ex)
        {
          context.Response.StatusCode = StatusCodes.Status500InternalServerError;
          await context.Response.WriteAsJsonAsync(new { message = $"Error deleting product: {ex.Message}" });
        }
      };
      
    private static RequestDelegate SearchProductsHandler() =>
      async (HttpContext context) =>
      {
          try
          {
            var catalogService = context.RequestServices.GetService<ICatalogService>();
            if (catalogService == null)
            {
              throw new NullReferenceException($"Not able to resolve {typeof(ICatalogService)} from service container");
            }
            
            // Parse product IDs from request body
            var requestData = await context.Request.ReadFromJsonAsync<SearchProductsRequest>();
            if (requestData?.ProductIds == null || !requestData.ProductIds.Any())
            {
              context.Response.StatusCode = StatusCodes.Status400BadRequest;
              await context.Response.WriteAsJsonAsync(new { message = "Product IDs are required" });
              return;
            }
            
            var products = catalogService.Products(requestData.ProductIds);

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