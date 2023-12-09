namespace Shop.App.Catalog.Api.Tests.IntegrationTests;

using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.DependencyInjection;
using Shop.App.Catalog.Api.Interfaces;
using Shop.App.Catalog.Api.Models;
using System.Text.Json;

[Collection("Sequential")]
public class ProductEndpointsTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly TestWebApplicationFactory<Program> _factory;
    private readonly HttpClient _httpClient;
    private readonly Moq.Mock<ICatalogService> _catalogServiceMock = new Moq.Mock<ICatalogService>();


    public ProductEndpointsTests(TestWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _httpClient = factory.CreateClient();
    }

    [Fact]
    public async Task GetProductsShouldReturnProducts()
    {
        var response = await _httpClient.GetFromJsonAsync<List<Product>>("/products");
        Assert.NotNull(response);
        Assert.Collection(response,
            item => Assert.Equal("Test Product", item.Title),
            item => Assert.Equal("Test Product 2", item.Title)
        );
    }

    [Fact]
    public async Task GetProductsByCategoryShouldReturnProducts()
    {
        const int expectedCategory = 69;
        var response = await _httpClient.GetFromJsonAsync<List<Product>>($"/products?categoryId={expectedCategory}");
        Assert.NotNull(response);
        Assert.Collection(response,
            item => Assert.Equal(expectedCategory, item.CategoryId),
            item => Assert.Equal(expectedCategory, item.CategoryId)
        );
    }

    [Fact]
    public async Task SearchProductsByIdShouldReturnProducts()
    {
        var expectedIDs = new[] { Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid() };
        var response = await _httpClient.PostAsJsonAsync("/products/search", expectedIDs);
        Assert.True(response.IsSuccessStatusCode);
        List<Product>? result = await response.Content.ReadFromJsonAsync<List<Product>>();
        Assert.NotNull(result);
        Assert.Collection(result,
            item => Assert.Equal(expectedIDs[0], item.Id),
            item => Assert.Equal(expectedIDs[1], item.Id),
            item => Assert.Equal(expectedIDs[2], item.Id)
        );
    }

    [Fact]
    public async Task GetCategoriesShouldReturnCategories()
    {
        var response = await _httpClient.GetFromJsonAsync<List<JsonElement>>("/productCategories");
        Assert.NotNull(response);
        Assert.Collection(response,
            item => Assert.Equal("Test Category 1", item.GetProperty("title").GetString()),
            item => Assert.Equal("Test Category 2", item.GetProperty("title").GetString())
        );
    }
}