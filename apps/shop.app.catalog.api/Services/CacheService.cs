using System.Text.Json;
using System.Text.Json.Serialization;
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
  private const int CATEGORIES_CACHE_TTL_SECONDS = 60 * 60; // 1 hour in seconds
  public const string CATEGORIES_CACHE_KEY = "CATEGORIES";
  private readonly IDatabase _database;
  private static readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions()
  {
    ReferenceHandler = ReferenceHandler.IgnoreCycles,
    UnmappedMemberHandling = JsonUnmappedMemberHandling.Skip
  };

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
    try
    {
      if (!_database.IsConnected(CATEGORIES_CACHE_KEY))
      {
        Console.WriteLine("Redis connection error. Returning categories from the database.");
        return getCategories();
      }

      var categories = await _database.StringGetAsync(CATEGORIES_CACHE_KEY);

      if (categories.IsNull)
      {
        var categoriesFromDb = await GetCategoriesFromDatabase(getCategories);
        await CacheCategories(categoriesFromDb);
        return categoriesFromDb.AsQueryable();
      }

      return DeserializeCategories(categories);
    }
    catch (RedisConnectionException ex)
    {
      Console.Error.WriteLine(ex.ToString());
      Console.WriteLine("Redis connection error. Returning categories from the database.");
      return getCategories();
    }
  }

  private static async Task<IEnumerable<Category>> GetCategoriesFromDatabase(Func<IEnumerable<Category>> getCategories)
  {
    var categories = getCategories();
    var categoriesFromDb = categories is IAsyncEnumerable<Category>
      ? await categories.AsQueryable().ToListAsync()
      : categories.ToList();
    return categoriesFromDb;
  }

  private async Task CacheCategories(IEnumerable<Category> categoriesFromDb)
  {
    await _database.StringSetAsync(CATEGORIES_CACHE_KEY,
      new RedisValue(JsonSerializer.Serialize(
        categoriesFromDb.ToArray(),
        _jsonSerializerOptions)
      ), TimeSpan.FromSeconds(CATEGORIES_CACHE_TTL_SECONDS));
  }

  private static IEnumerable<Category> DeserializeCategories(RedisValue categories)
  {
    return JsonSerializer.Deserialize<Category[]>(categories.ToString(), _jsonSerializerOptions)
      ?? Array.Empty<Category>();
  }
}
