using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Shop.App.Catalog.Api.Auth
{
    public class AdminAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
    {
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            // Check if user is authenticated and has admin role
            var isAdmin = context.HttpContext.Items["IsAdmin"] as bool?;
            
            if (isAdmin != true)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Administrator access required" });
                return;
            }
            
            await Task.CompletedTask;
        }
    }
}
