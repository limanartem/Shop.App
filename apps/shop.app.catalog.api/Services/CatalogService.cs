using Microsoft.EntityFrameworkCore;
using Shop.App.Catalog.Api.Db;
using Shop.App.Catalog.Api.Interfaces;
using Shop.App.Catalog.Api.Models;

namespace Shop.App.Catalog.Api.Services
{
  /// <summary>
  /// Represents a service for managing the catalog of categories and products.
  /// </summary>
  public class CatalogService : ICatalogService
  {
    private readonly AppDbContext context;
    private readonly ICacheService cacheService;

    public CatalogService(AppDbContext context, ICacheService cacheService)
    {
      this.context = context;
      this.cacheService = cacheService;
    }
    
    /// <summary>
    /// Gets a product by ID.
    /// </summary>
    /// <param name="id">The product ID.</param>
    /// <returns>The requested product or null if not found.</returns>
    public async Task<Product?> GetProductByIdAsync(Guid id)
    {
      return await context.Products
        .Include(p => p.Category)
        .FirstOrDefaultAsync(p => p.Id == id);
    }
    
    /// <summary>
    /// Creates a new product.
    /// </summary>
    /// <param name="product">The product to create.</param>
    /// <returns>The created product.</returns>
    public async Task<Product> CreateProductAsync(Product product)
    {
      // Ensure new GUID if none provided
      if (product.Id == Guid.Empty)
      {
        product.Id = Guid.NewGuid();
      }
      
      await context.Products.AddAsync(product);
      await context.SaveChangesAsync();
      
      // Clear cache to ensure fresh data
      await cacheService.ClearProductCache();
      
      return product;
    }
    
    /// <summary>
    /// Updates an existing product.
    /// </summary>
    /// <param name="id">The ID of the product to update.</param>
    /// <param name="product">The updated product data.</param>
    /// <returns>The updated product, or null if not found.</returns>
    public async Task<Product?> UpdateProductAsync(Guid id, Product product)
    {
      var existingProduct = await context.Products.FindAsync(id);
      
      if (existingProduct == null)
      {
        return null;
      }
      
      // Update properties
      existingProduct.Title = product.Title;
      existingProduct.Description = product.Description;
      existingProduct.Price = product.Price;
      existingProduct.Currency = product.Currency;
      existingProduct.CategoryId = product.CategoryId;
      existingProduct.PreviewImageUrls = product.PreviewImageUrls;
      
      context.Products.Update(existingProduct);
      await context.SaveChangesAsync();
      
      // Clear cache to ensure fresh data
      await cacheService.ClearProductCache();
      
      return existingProduct;
    }
    
    /// <summary>
    /// Deletes a product.
    /// </summary>
    /// <param name="id">The ID of the product to delete.</param>
    /// <returns>True if the product was deleted, false if not found.</returns>
    public async Task<bool> DeleteProductAsync(Guid id)
    {
      var product = await context.Products.FindAsync(id);
      
      if (product == null)
      {
        return false;
      }
      
      context.Products.Remove(product);
      await context.SaveChangesAsync();
      
      // Clear cache to ensure fresh data
      await cacheService.ClearProductCache();
      
      return true;
    }

    /// <summary>
    /// Retrieves all categories.
    /// </summary>
    /// <returns>An <see cref="IQueryable{T}"/> of <see cref="Category"/> representing all categories.</returns>
    public async Task<IQueryable<Category>> Categories()
    {
      return (await cacheService.Categories(() => context.Categories)).AsQueryable();
    }

    /// <summary>
    /// Retrieves all products.
    /// </summary>
    /// <returns>An <see cref="IQueryable{T}"/> of <see cref="Product"/> representing all products.</returns>
    public IQueryable<Product> Products()
    {
      return context.Products;
    }

    /// <summary>
    /// Retrieves products based on the specified category ID and its nested categories.
    /// </summary>
    /// <param name="categoryId">The ID of the category.</param>
    /// <returns>An <see cref="IQueryable{T}"/> of <see cref="Product"/> representing the products.</returns>
    public async Task<IQueryable<Product>> Products(int categoryId)
    {
      var categories = await GetAllNestedCategories(categoryId);

      return context.Products.Where(p => categories.Contains(p.CategoryId));
    }

    /// <summary>
    /// Retrieves products based on the specified IDs.
    /// </summary>
    /// <param name="ids">The IDs of the products.</param>
    /// <returns>An <see cref="IQueryable{T}"/> of <see cref="Product"/> representing the products.</returns>
    public IQueryable<Product> Products(Guid[] ids)
    {
      return context.Products.Where(p => ids.Contains(p.Id));
    }

    private async Task<IEnumerable<int>> GetAllNestedCategories(int parentCategoryId)
    {
      var categories = await Categories();
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