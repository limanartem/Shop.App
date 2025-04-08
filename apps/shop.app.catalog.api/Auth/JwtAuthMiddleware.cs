using System.Text.Json;

namespace Shop.App.Catalog.Api.Auth
{
    public class JwtAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public JwtAuthMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (token != null)
            {
                try
                {
                    // For SuperTokens integration, we need to validate the session
                    // The session token is sent to the auth service to verify
                    using (var client = new HttpClient())
                    {
                        var authApiUrl = _configuration["AUTH_API_URL_PRIVATE"] ?? "http://shop.app.auth.api:3003";
                        
                        var verifyRequest = new HttpRequestMessage(HttpMethod.Get, $"{authApiUrl}/auth/session/verify");
                        verifyRequest.Headers.Add("Authorization", $"Bearer {token}");
                        
                        var response = await client.SendAsync(verifyRequest);
                        
                        if (response.IsSuccessStatusCode)
                        {
                            var responseContent = await response.Content.ReadAsStringAsync();
                            var userInfo = System.Text.Json.JsonSerializer.Deserialize<UserInfo>(responseContent);
                            
                            if (userInfo != null)
                            {
                                // Set user information in the context for later use
                                context.Items["UserId"] = userInfo.UserId;
                                context.Items["UserEmail"] = userInfo.Email;
                                context.Items["UserRoles"] = userInfo.Roles;
                                context.Items["IsAdmin"] = userInfo.Roles?.Contains("admin") ?? false;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error validating token: {ex.Message}");
                    // Don't throw here - we'll handle unauthorized access in the endpoint
                }
            }

            await _next(context);
        }
    }

    public class UserInfo
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public List<string>? Roles { get; set; }
    }

    // Extension method to add the middleware to the HTTP request pipeline
    public static class JwtAuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseJwtAuth(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<JwtAuthMiddleware>();
        }
    }
}
