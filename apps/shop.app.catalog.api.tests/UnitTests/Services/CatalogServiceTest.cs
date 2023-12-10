namespace Shop.App.Catalog.Api.Tests.UnitTests;

using Shop.App.Catalog.Api.Db;
using Shop.App.Catalog.Api.Models;
using Shop.App.Catalog.Api.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

[Trait("Category", "Unit")]
public class CatalogServiceTests
{
  [Fact]
  public void Categories_ReturnsAllCategories()
  {
    // Arrange
    var categories = new List<Category>
        {
            new() { Id = 1, Name = "Category 1" },
            new() { Id = 2, Name = "Category 2" },
            new() { Id = 3, Name = "Category 3" }
        };

    var mockContext = DbContextMock.GetMock<Category, AppDbContext>(categories, c => c.Categories);

    var catalogService = new CatalogService(mockContext);

    // Act
    var result = catalogService.Categories().ToList();

    // Assert
    Assert.Equal(categories, result);
  }

  [Fact]
  public async Task Products_ReturnsAllProducts()
  {
    // Arrange
    var products = new List<Product>
    {
      new() { Id = Guid.NewGuid(), CategoryId = 1, Title = "Title 1", Description = "Description 1", Price = 10.99m, Currency = "USD" },
      new() { Id = Guid.NewGuid(), CategoryId = 2, Title = "Title 2", Description = "Description 2", Price = 19.99m, Currency = "USD" },
      new() { Id = Guid.NewGuid(), CategoryId = 3, Title = "Title 3", Description = "Description 3", Price = 14.99m, Currency = "USD" }
    };

    var mockContext = DbContextMock.GetMock<Product, AppDbContext>(products, c => c.Products);

    var catalogService = new CatalogService(mockContext);

    // Act
    var result = catalogService.Products().ToList();

    // Assert
    Assert.Equal(products, result);
  }

  [Fact]
  public async Task Products_ByCategoryId_ReturnsProducts()
  {
    // Arrange
    var categoryId = 1;

    var categories = new List<Category>
        {
            new() { Id = 1, Name = "Category 1" },
            new() { Id = 2, Name = "Category 2" },
            new() { Id = 3, Name = "Category 3" }
        }.ToAsyncEnumerable();
        

    var products = new List<Product>
    {
      new() { Id = Guid.NewGuid(), CategoryId = 1, Title = "Title 1", Description = "Description 1", Price = 10.99m, Currency = "USD" },
      new() { Id = Guid.NewGuid(), CategoryId = 2, Title = "Title 2", Description = "Description 2", Price = 19.99m, Currency = "USD" },
      new() { Id = Guid.NewGuid(), CategoryId = 3, Title = "Title 3", Description = "Description 3", Price = 14.99m, Currency = "USD" }
    };

    var mockContext = DbContextMock
      .ContextMock<Product, AppDbContext>(null, products, c => c.Products)
      .ContextMock<Category, AppDbContext>(categories, c => c.Categories);

    var catalogService = new CatalogService(mockContext.Object);

    // Act
    var result = await catalogService.Products(categoryId);

    // Assert
    Assert.Equal(products.Where(p => p.CategoryId == categoryId), result.ToList());
  }

  [Fact]
  public async Task Products_ByProductIds_ReturnsProducts()
  {
    // Arrange
    var productIds = new Guid[] { Guid.NewGuid(), Guid.NewGuid() };
    var products = new List<Product>
    {
      new() { Id = Guid.NewGuid(), CategoryId = 1, Title = "Title 1", Description = "Description 1", Price = 10.99m, Currency = "USD" },
      new() { Id = Guid.NewGuid(), CategoryId = 2, Title = "Title 2", Description = "Description 2", Price = 19.99m, Currency = "USD" },
      new() { Id = Guid.NewGuid(), CategoryId = 3, Title = "Title 3", Description = "Description 3", Price = 14.99m, Currency = "USD" }
    };

    var mockContext = DbContextMock.GetMock<Product, AppDbContext>(products, c => c.Products);


    var catalogService = new CatalogService(mockContext);

    // Act
    var result = catalogService.Products(productIds).ToList();

    // Assert
    Assert.Equal(products.Where(p => productIds.Contains(p.Id)), result);
  }
}