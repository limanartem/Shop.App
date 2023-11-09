using Shop.App.Catalog.Api.Db;
using Shop.App.Catalog.Api.Interfaces;
using Shop.App.Catalog.Api.Models;

namespace Shop.App.Catalog.Api.Services
{
  public class CatalogService : ICatalogService
  {
    private readonly AppDbContext context;

    public CatalogService(AppDbContext context)
    {
      this.context = context;
    }

    public IQueryable<Category> Categories()
    {
      return context.Categories;
    }

    public IQueryable<Product> Products()
    {
      return context.Products;
    }
  }
}