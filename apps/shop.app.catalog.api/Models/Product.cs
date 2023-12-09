namespace Shop.App.Catalog.Api.Models {
  public class Product
  {
    public Guid Id { get; set; }
    public int CategoryId { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
    public required string Currency { get; set; }
    public required string PreviewImageUrls { get; set; }

    // Navigation Property
    public virtual required Category Category { get; set; }
  }
}