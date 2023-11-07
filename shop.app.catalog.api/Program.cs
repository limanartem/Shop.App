var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
  options.AddPolicy("myAppCors", policy =>
  {
    policy.WithOrigins("*")
              .AllowAnyHeader()
              .AllowAnyMethod();
  });
});

var app = builder.Build();

app.MapGet("/products", () =>
{
  return new[] {
    new { id = "1", title = "Sofa", category = "1" },
    new { id = "2", title = "Cupboard", category = "1" },
  };
});

app.MapGet("/productCategories", () =>
{
  return new[] {
    new { id = "1", title = "For your house" },
    new { id = "2", title = "Electronics" },
    new { id = "3", title = "Kids" },
    new { id = "4", title = "Clothes" },
  };
});


app.UseCors("myAppCors");
app.Run();
