using Shop.App.Catalog.Api.Models;

namespace Shop.App.Catalog.Api.Interfaces {
  /// <summary>
  /// Represents a catalog service that provides access to categories and products.
  /// </summary>
  public interface ICatalogService
  {
    /// <summary>
    /// Gets all categories.
    /// </summary>
    /// <returns>An <see cref="IQueryable{T}"/> of <see cref="Category"/>.</returns>
    IQueryable<Category> Categories();

    /// <summary>
    /// Gets all products.
    /// </summary>
    /// <returns>An <see cref="IQueryable{T}"/> of <see cref="Product"/>.</returns>
    IQueryable<Product> Products();

    /// <summary>
    /// Gets products by category ID.
    /// </summary>
    /// <param name="categoryId">The category ID.</param>
    /// <returns>A <see cref="Task{TResult}"/> of <see cref="IQueryable{T}"/> of <see cref="Product"/>.</returns>
    Task<IQueryable<Product>> Products(int categoryId);

    /// <summary>
    /// Gets products by IDs.
    /// </summary>
    /// <param name="ids">The product IDs.</param>
    /// <returns>An <see cref="IQueryable{T}"/> of <see cref="Product"/>.</returns>
    IQueryable<Product> Products(Guid[] ids);
  }
}