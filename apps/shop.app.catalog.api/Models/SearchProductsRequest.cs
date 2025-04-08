namespace Shop.App.Catalog.Api.Models
{
    public class SearchProductsRequest
    {
        public Guid[] ProductIds { get; set; } = Array.Empty<Guid>();
    }
}
