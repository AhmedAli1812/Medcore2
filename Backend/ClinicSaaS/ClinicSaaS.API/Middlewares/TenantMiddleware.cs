using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace ClinicSaaS.API.Middleware;

/// <summary>
/// Extracts ClinicId from JWT claims and injects into HttpContext.Items.
/// Expected claim type: "clinic_id" (string GUID).
/// Blocks access if ClinicId is missing.
/// </summary>
public sealed class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip tenant check for health checks and auth endpoints
        if (context.Request.Path.StartsWithSegments("/health") ||
            context.Request.Path.StartsWithSegments("/api/auth/login") ||
            context.Request.Path.StartsWithSegments("/api/auth/create-user"))
        {
            await _next(context).ConfigureAwait(false);
            return;
        }

        if (context.User?.Identity?.IsAuthenticated == true)
        {
            var clinicClaim = context.User.FindFirst("clinic_id") ?? context.User.FindFirst(ClaimTypes.GroupSid);
            if (clinicClaim is not null && Guid.TryParse(clinicClaim.Value, out var clinicId))
            {
                context.Items["ClinicId"] = clinicId;
                await _next(context).ConfigureAwait(false);
                return;
            }

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { message = "Clinic ID not found in token." }).ConfigureAwait(false);
            return;
        }

        await _next(context).ConfigureAwait(false);
    }
}

/// <summary>
/// Helper extension to retrieve ClinicId from HttpContext in a typed manner.
/// </summary>
public static class HttpContextTenantExtensions
{
    /// <summary>
    /// Gets the current request's ClinicId if available.
    /// </summary>
    public static Guid? GetClinicId(this HttpContext context)
    {
        if (context.Items.TryGetValue("ClinicId", out var value) && value is Guid id)
        {
            return id;
        }

        return null;
    }

    /// <summary>
    /// Gets the current user's ID from JWT claims.
    /// </summary>
    public static Guid? GetUserId(this HttpContext context)
    {
        var claim = context.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is not null && Guid.TryParse(claim.Value, out var userId))
        {
            return userId;
        }

        return null;
    }
}