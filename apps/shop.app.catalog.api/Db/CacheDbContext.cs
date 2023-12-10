using Shop.App.Catalog.Api.Interfaces;
using StackExchange.Redis;

namespace Shop.App.Catalog.Api.Db
{
  /// <summary>
  /// Represents a database context for caching data using Redis.
  /// </summary>
  public class CacheDbContext : ICacheDatabaseProvider
  {
    private readonly IConnectionMultiplexer _connectionMultiplexer;

    /// <summary>
    /// Initializes a new instance of the <see cref="CacheDbContext"/> class.
    /// </summary>
    /// <param name="configuration">The configuration.</param>
    public CacheDbContext(IConfiguration configuration)
    {
      _connectionMultiplexer = GetConnectionMultiplexer(configuration);
    }

    /// <summary>
    /// Gets the Redis database.
    /// </summary>
    /// <returns>The Redis database.</returns>
    public IDatabase GetDatabase()
    {
      return _connectionMultiplexer.GetDatabase();
    }

    private IConnectionMultiplexer GetConnectionMultiplexer(IConfiguration configuration)
    {
      var connectionString = GetConnectionString(configuration);

      Console.WriteLine($"Connecting to Redis using '{connectionString}' connection string");

      if (string.IsNullOrEmpty(connectionString))
      {
        throw new Exception("Redis connection string not found.");
      }

      return ConnectionMultiplexer.Connect(connectionString);
    }

    private string GetConnectionString(IConfiguration configuration)
    {
      var host = Environment.GetEnvironmentVariable("REDIS_HOST");
      var port = Environment.GetEnvironmentVariable("REDIS_PORT");

      if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(port))
      {
        var connectionString = configuration.GetConnectionString("redisCacheConnectionString");
        return connectionString ?? throw new Exception("Redis connection string not found.");
      }
      else
      {
        var password = Environment.GetEnvironmentVariable("REDIS_PASSWORD");

        var redisOptions = new ConfigurationOptions
        {
          EndPoints = { $"{host}:{port}" },
          Password = password,
          AbortOnConnectFail = false
        };

        return redisOptions.ToString();
      }
    }
  }
}