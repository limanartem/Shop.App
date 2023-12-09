namespace Shop.App.Catalog.Api.Tests.IntegrationTests;

using Moq;
using Shop.App.Catalog.Api.Interfaces;
using Shop.App.Catalog.Api.Models;
using Shop.App.Catalog.Api.Services;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

[Trait("Category", "Unit")]
public class CacheServiceTests
{
    [Fact]
    public async Task Categories_WhenCategoriesAreNotCached_ReturnsCategoriesFromDatabase()
    {
        // Arrange
        var expectedCategories = new List<Category>
            {
                new() { Id = 1, Name = "Category 1" },
                new() { Id = 2, Name = "Category 2" },
                new() { Id = 3, Name = "Category 3" }
            };

        var mockDatabase = new Mock<IDatabase>();
        mockDatabase.Setup(d => d.StringGetAsync("categories", It.IsAny<CommandFlags>())).ReturnsAsync(RedisValue.Null);
        mockDatabase.Setup(d => d.StringSetAsync("categories", It.IsAny<RedisValue>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>())).Returns(Task.FromResult(true));

        var mockProvider = new Mock<ICacheDatabaseProvider>();
        mockProvider.Setup(p => p.GetDatabase()).Returns(mockDatabase.Object);

        var cacheService = new CacheService(mockProvider.Object);

        // Act
        var result = await cacheService.Categories(() => Task.FromResult<IEnumerable<Category>>(expectedCategories));

        // Assert
        Assert.Equivalent(expectedCategories, result);
        mockDatabase.Verify(d => d.StringGetAsync("categories", It.IsAny<CommandFlags>()), Times.Once);
        mockDatabase.Verify(d => d.StringSetAsync("categories", It.IsAny<RedisValue>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>()), Times.Once);
    }

    [Fact]
    public async Task Categories_WhenCategoriesAreCached_ReturnsCategoriesFromCache()
    {
        // Arrange
        var expectedCategories = new List<Category>
            {
                new() { Id = 1, Name = "Category 1" },
                new() { Id = 2, Name = "Category 2" },
                new() { Id = 3, Name = "Category 3" }
            };

        var mockDatabase = new Mock<IDatabase>();
        mockDatabase
            .Setup(d => d.StringGetAsync("categories", It.IsAny<CommandFlags>()))
            .Returns(Task.FromResult(new RedisValue(JsonSerializer.Serialize(expectedCategories.ToArray()))));

        var mockProvider = new Mock<ICacheDatabaseProvider>();
        mockProvider.Setup(p => p.GetDatabase()).Returns(mockDatabase.Object);

        var cacheService = new CacheService(mockProvider.Object);


        // Act
        var result = await cacheService.Categories(() => throw new Exception("This should not be called"));

        // Assert
        Assert.Equivalent(expectedCategories, result);
        mockDatabase.Verify(d => d.StringGetAsync("categories", It.IsAny<CommandFlags>()), Times.Once);
        mockDatabase.Verify(d => d.StringSetAsync("categories", It.IsAny<RedisValue>(), It.IsAny<TimeSpan>(), It.IsAny<When>()), Times.Never);
    }
}