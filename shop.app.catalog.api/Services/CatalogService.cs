using Microsoft.EntityFrameworkCore;
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

    public async Task<IQueryable<Product>> Products(int categoryId)
    {
      var categories = await GetAllNestedCategories(categoryId);

      return context.Products.Where(p => categories.Contains(p.CategoryId));
    }

    private async Task<IEnumerable<int>> GetAllNestedCategories(int parentCategoryId)
    {
      var categories = await Categories().ToListAsync();
      var categoryIds = new HashSet<int>();
      var stack = new Stack<int>();
      stack.Push(parentCategoryId);

      while (stack.Count > 0)
      {
        var categoryId = stack.Pop();
        categoryIds.Add(categoryId);

        var childCategories = categories.Where(c => c.ParentCategoryId == categoryId);
        foreach (var childCategory in childCategories)
        {
          stack.Push(childCategory.Id);
        }
      }
      return categoryIds;
    }
  }
}