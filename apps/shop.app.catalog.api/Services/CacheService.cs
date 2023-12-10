using System.Text.Json;
using Microsoft.EntityFrameworkCore;
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
  public async Task<IEnumerable<Category>> Categories(Func<IEnumerable<Category>> getCategories)
  {
    var categories = await _database.StringGetAsync("categories");

    if (categories.IsNull)
    {
      var categories1 = getCategories();
      var categoriesFromDb = categories1 is IAsyncEnumerable<Category>
        ? await categories1.AsQueryable().ToListAsync()
        : categories1.ToList();
      await _database.StringSetAsync("categories",
        new RedisValue(JsonSerializer.Serialize(categoriesFromDb.ToArray())));
      return categoriesFromDb.AsQueryable();
    }

    return JsonSerializer.Deserialize<Category[]>(categories.ToString()).AsQueryable();
  }
}
