using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using ClinicSaaS.Shared.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace ClinicSaaS.API.Middleware;

/// <summary>
/// Global exception handling middleware.
/// </summary>
public sealed class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex).ConfigureAwait(false);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            UnauthorizedAccessException => new { statusCode = HttpStatusCode.Forbidden, message = "Access denied." },
            _ => new { statusCode = HttpStatusCode.InternalServerError, message = "An unexpected error occurred." }
        };

        context.Response.StatusCode = (int)(response.statusCode);

        var result = Result.Fail(response.message);
        return context.Response.WriteAsJsonAsync(result);
    }
}

/// <summary>
/// Extension method to use global exception handler middleware.
/// </summary>
public static class GlobalExceptionHandlerMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
    }
}