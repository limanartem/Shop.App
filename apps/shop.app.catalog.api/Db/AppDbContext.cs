namespace Shop.App.Catalog.Api.Db
{
  using System.Configuration;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.Extensions.Configuration;
  using Shop.App.Catalog.Api.Models;

  /// <summary>
  /// Represents the database context for the application.
  /// </summary>
  public class AppDbContext : DbContext
  {
    public virtual DbSet<Category> Categories { get; set; }
    public virtual DbSet<Product> Products { get; set; }

    private readonly IConfiguration _configuration;

    public AppDbContext(IConfiguration configuration)
    {
      _configuration = configuration;
    }

    public AppDbContext()
    {
      // Required for testing
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
      // Retrieve the connection string from environment variables
      string host = Environment.GetEnvironmentVariable("DB_HOST");
      string database = Environment.GetEnvironmentVariable("DB_DATABASE");
      string user = Environment.GetEnvironmentVariable("DB_USER");
      string password = Environment.GetEnvironmentVariable("DB_PASSWORD");

      string? connectionString = string.IsNullOrEmpty(host)
        ? _configuration.GetConnectionString("defaultConnectionString")
        : $"Server={host};Database={database};User={user};Password={password};";
      Console.WriteLine($"Connecting to db using '{connectionString}' connection string");

      // Configure your MySQL database connection here
      optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Category>()
          .HasOne(c => c.ParentCategory)
          .WithMany(c => c.SubCategories)
          .HasForeignKey(c => c.ParentCategoryId)
          .IsRequired(false);

      modelBuilder.Entity<Category>()
          .HasMany(c => c.Products)
          .WithOne(p => p.Category)
          .HasForeignKey(p => p.CategoryId)
          .IsRequired();

    }
  }
}