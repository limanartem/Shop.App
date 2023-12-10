using System.Text.Json.Serialization;

namespace Shop.App.Catalog.Api.Models
{
  public class Category
  {
    public int Id { get; set; }
    public int? ParentCategoryId { get; set; }
    public required string Name { get; set; }

    // Navigation Property
    [JsonIgnore]
    public virtual Category? ParentCategory { get; set; }
    [JsonIgnore]
    public virtual ICollection<Category>? SubCategories { get; set; }
    [JsonIgnore]
    public virtual ICollection<Product>? Products { get; set; }
  }
}