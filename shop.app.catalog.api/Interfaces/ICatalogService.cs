using Shop.App.Catalog.Api.Models;

namespace Shop.App.Catalog.Api.Interfaces {
  public interface ICatalogService
  {
     IQueryable<Category> Categories();
     IQueryable<Product> Products();
  }
}