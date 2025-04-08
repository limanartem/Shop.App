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
    Task<IQueryable<Category>> Categories();

    /// <summary>
    /// Gets all products.
    /// </summary>
    /// <returns>An <see cref="IQueryable{T}"/> of <see cref="Product"/>.</returns>
    IQueryable<Product> Products();
    
    /// <summary>
    /// Gets a product by ID.
    /// </summary>
    /// <param name="id">The product ID.</param>
    /// <returns>The requested product or null if not found.</returns>
    Task<Product?> GetProductByIdAsync(Guid id);
    
    /// <summary>
    /// Creates a new product.
    /// </summary>
    /// <param name="product">The product to create.</param>
    /// <returns>The created product.</returns>
    Task<Product> CreateProductAsync(Product product);
    
    /// <summary>
    /// Updates an existing product.
    /// </summary>
    /// <param name="id">The ID of the product to update.</param>
    /// <param name="product">The updated product data.</param>
    /// <returns>The updated product, or null if not found.</returns>
    Task<Product?> UpdateProductAsync(Guid id, Product product);
    
    /// <summary>
    /// Deletes a product.
    /// </summary>
    /// <param name="id">The ID of the product to delete.</param>
    /// <returns>True if the product was deleted, false if not found.</returns>
    Task<bool> DeleteProductAsync(Guid id);

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