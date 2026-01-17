using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.API.Middleware;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Application.Services;
using ClinicSaaS.Shared.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ClinicSaaS.API.Controllers;

/// <summary>
/// Authentication controller for user login and registration.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private const string DemoClinicId = "550e8400-e29b-41d4-a716-446655440000";

    public AuthController(IAuthService authService)
    {
        _authService = authService ?? throw new ArgumentNullException(nameof(authService));
    }

    /// <summary>
    /// Login with username and password. Returns JWT token.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(Result<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LoginAsync(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid request."));
        }

        var clinicId = Guid.Parse(DemoClinicId);
        var result = await _authService.LoginAsync(request, clinicId, cancellationToken).ConfigureAwait(false);

        return result.Success ? Ok(result) : Unauthorized(result);
    }

    /// <summary>
    /// Create a new user in the clinic (admin only).
    /// </summary>
    [HttpPost("create-user")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Result<UserResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUserAsync(
        [FromBody] CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid request."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _authService.CreateUserAsync(request, clinicId, cancellationToken).ConfigureAwait(false);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetUserAsync), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Get current authenticated user information.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(Result<UserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUserAsync(CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        if (userId == Guid.Empty)
        {
            return Unauthorized(Result.Fail("User not authenticated."));
        }

        var result = await _authService.GetUserAsync(userId, clinicId, cancellationToken).ConfigureAwait(false);
        return result.Success ? Ok(result) : NotFound(result);
    }
}