namespace Shop.App.Catalog.Api.Models {
  public class Product
  {
    public Guid Id { get; set; }
    public int CategoryId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public string PreviewImageUrls { get; set; }

    // Navigation Property
    public virtual Category Category { get; set; }
  }
}