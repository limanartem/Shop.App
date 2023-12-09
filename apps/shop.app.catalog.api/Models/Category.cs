namespace Shop.App.Catalog.Api.Models
{
  public class Category
  {
    public int Id { get; set; }
    public int? ParentCategoryId { get; set; }
    public required string Name { get; set; }

    // Navigation Property
    public virtual Category? ParentCategory { get; set; }
    public virtual ICollection<Category>? SubCategories { get; set; }
    public virtual ICollection<Product>? Products { get; set; }
  }
}