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
    
    public bool IsReadOnly { get; set; } = true;

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
      string connectionString;
      
      // Choose the appropriate connection string based on read/write operations
      if (IsReadOnly)
      {
        // For read operations, use the default connection string
        connectionString = _configuration?.GetConnectionString("defaultConnectionString") ?? "Server=localhost;Database=Catalog;User=catalogReader;Password=qwerty123;";
      }
      else
      {
        // For write operations, use the write connection string
        connectionString = _configuration?.GetConnectionString("writeConnectionString") ?? "Server=localhost;Database=Catalog;User=catalogWriter;Password=qwerty123;";
      }
      
      // If environment variables are set, override from environment (container deployment)
      string host = Environment.GetEnvironmentVariable("DB_HOST");
      if (!string.IsNullOrEmpty(host))
      {
        string database = Environment.GetEnvironmentVariable("DB_DATABASE") ?? "Catalog";
        string user = IsReadOnly 
          ? Environment.GetEnvironmentVariable("DB_USER") ?? "catalogReader"
          : "catalogWriter";
        string password = IsReadOnly
          ? Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "qwerty123"
          : Environment.GetEnvironmentVariable("DB_WRITER_PASSWORD") ?? "qwerty123";
            
        connectionString = $"Server={host};Database={database};User={user};Password={password};";
      }
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