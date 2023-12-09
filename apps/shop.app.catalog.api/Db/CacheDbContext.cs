using Shop.App.Catalog.Api.Interfaces;
using StackExchange.Redis;

namespace Shop.App.Catalog.Api.Db;

/// <summary>
/// Represents a database context for caching data using Redis.
/// </summary>
public class CacheDbContext : ICacheDatabaseProvider
{
  private readonly IConnectionMultiplexer _connectionMultiplexer;

  public CacheDbContext(IConfiguration configuration)
  {
    var connectionString = configuration.GetConnectionString("redisCacheConnectionString");
    _connectionMultiplexer = ConnectionMultiplexer.Connect(connectionString);
  }

  public IDatabase GetDatabase()
  {
    return _connectionMultiplexer.GetDatabase();
  }
}
