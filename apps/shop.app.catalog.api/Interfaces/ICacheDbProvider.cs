
using StackExchange.Redis;

namespace Shop.App.Catalog.Api.Interfaces;

/// <summary>
/// Represents a provider for accessing the cache database.
/// </summary>
public interface ICacheDatabaseProvider
{
  /// <summary>
  /// Gets the cache database instance.
  /// </summary>
  /// <returns>The cache database instance.</returns>
  IDatabase GetDatabase();
}