using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using Shop.App.Catalog.Api.Models;
using Xunit;

namespace Shop.App.Catalog.Api.Tests.UnitTests
{
  [Trait("Category", "Unit")]
  public class SerializationTests
  {
    [Fact]
    public void DeserializeCategoriesFromFile()
    {
      // Arrange
      var filePath = "../TestData/Categories.Full.json";

      // Act
      var json = TestFileUtils.ReadFileAsString(filePath);
      var categories = JsonSerializer.Deserialize<Category[]>(json, new JsonSerializerOptions()
      {
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Skip,
      });

      // Assert
      Assert.NotNull(categories);
      Assert.NotEmpty(categories);
    }
  }
}