using System.Text.Json;
using Shop.App.Catalog.Api.Interfaces;
using Shop.App.Catalog.Api.Models;
using StackExchange.Redis;

namespace Shop.App.Catalog.Api.Services;

/// <summary>
/// Represents a service for caching data.
/// </summary>
public class CacheService : ICacheService
{
  private readonly IDatabase _database;

  public CacheService(ICacheDatabaseProvider redis)
  {
    _database = redis.GetDatabase();
  }

  /// <summary>
  /// Retrieves the categories from the cache or database.
  /// If the categories are not found in the cache, they are fetched from the database and stored in the cache for future use.
  /// </summary>
  /// <param name="getCategories">A function that retrieves the categories from the database.</param>
  /// <returns>The categories.</returns>
  public async Task<IEnumerable<Category>> Categories(Func<Task<IEnumerable<Category>>> getCategories)
  {
    var categories = await _database.StringGetAsync("categories");

    if (categories.IsNull)
    {
      var categoriesFromDb = await getCategories();
      await _database.StringSetAsync("categories",
        new RedisValue(JsonSerializer.Serialize(categoriesFromDb.ToArray())));
      return categoriesFromDb;
    }

    return JsonSerializer.Deserialize<Category[]>(categories.ToString());
  }
}
