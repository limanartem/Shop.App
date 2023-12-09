namespace Shop.App.Catalog.Api.Tests.IntegrationTests;

using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Moq;
using Shop.App.Catalog.Api.Db;
using Shop.App.Catalog.Api.Interfaces;
using Shop.App.Catalog.Api.Models;

public class TestWebApplicationFactory<TProgram>
    : WebApplicationFactory<TProgram> where TProgram : class
{

  protected override IHost CreateHost(IHostBuilder builder)
  {
    builder.ConfigureServices(services =>
    {
      services.RemoveAll<ICatalogService>();
      services.RemoveAll<AppDbContext>();

      var catalogServiceMock = new Moq.Mock<ICatalogService>();
      catalogServiceMock.Setup(s => s.Products())
          .Returns(new List<Product>
          {
            new Product
            {
                Id = Guid.NewGuid(),
                Title = "Test Product",
                Description = "Test Product Description",
                Price = 100,
                Currency = "EUR",
                CategoryId = 1
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Title = "Test Product 2",
                Description = "Test Product Description 2",
                Price = 200.50M,
                Currency = "EUR",
                CategoryId = 2
            }
          }.AsQueryable());

      catalogServiceMock.Setup(s => s.Products(It.IsAny<int>()))
        .Returns((int categoryId) => Task.FromResult(new List<Product>
        {
          new Product
          {
              Id = Guid.NewGuid(),
              Title = "Test Product",
              Description = "Test Product Description",
              Price = 100,
              Currency = "EUR",
              CategoryId = categoryId
          },
          new Product
          {
              Id = Guid.NewGuid(),
              Title = "Test Product 2",
              Description = "Test Product Description 2",
              Price = 200.50M,
              Currency = "EUR",
              CategoryId = categoryId
          }
        }.AsQueryable()));

      catalogServiceMock.Setup(s => s.Products(It.IsAny<Guid[]>()))
        .Returns((Guid[] ids) => ids.Select((id, i) =>
          new Product
          {
            Id = id,
            Title = $"Test Product {i}",
            Description = $"Test Product Description {i}",
            Price = 100,
            Currency = "EUR",
            CategoryId = 1
          })
        .AsQueryable());

      catalogServiceMock.Setup(s => s.Categories())
        .Returns(new List<Category>
        {
            new Category
            {
              Id = 1,
              Name = "Test Category 1",
              ParentCategoryId = null
            },
            new Category
            {
              Id = 2,
              Name = "Test Category 2",
              ParentCategoryId = 1
            }
        }.AsQueryable());

      services.AddSingleton(catalogServiceMock.Object);
    });

    return base.CreateHost(builder);
  }
}