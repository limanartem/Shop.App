namespace Shop.App.Catalog.Api.Models
{
  public class Category
  {
    public int Id { get; set; }
    public int? ParentCategoryId { get; set; }
    public required string Name { get; set; }

    // Navigation Property
    public virtual required Category ParentCategory { get; set; }
    public virtual required ICollection<Category> SubCategories { get; set; }
    public virtual required ICollection<Product> Products { get; set; }
  }
}