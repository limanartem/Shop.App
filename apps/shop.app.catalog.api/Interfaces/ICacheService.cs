using Shop.App.Catalog.Api.Models;

namespace Shop.App.Catalog.Api.Interfaces;
/// <summary>
/// Represents a cache service that provides access to cache database.
/// </summary>

public interface ICacheService
{
  /// <summary>
  /// Gets all categories.
  /// </summary>
  /// <returns>An <see cref="IQueryable{T}"/> of <see cref="Category"/>.</returns>
  /// <summary>
  /// Retrieves the categories from the cache or calls the provided function to get the categories and stores them in the cache.
  /// </summary>
  /// <param name="getCategories">A function that returns a task that represents the asynchronous operation of getting the categories.</param>
  /// <returns>A task that represents the asynchronous operation of retrieving the categories.</returns>
  Task<IEnumerable<Category>> Categories(Func<Task<IEnumerable<Category>>> getCategories);

}