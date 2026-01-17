using System;

namespace ClinicSaaS.Application.DTOs;

/// <summary>
/// DTO for login request.
/// </summary>
public sealed class LoginRequest
{
    public string UserName { get; set; } = null!;
    public string Password { get; set; } = null!;
}

/// <summary>
/// DTO for login response with JWT token.
/// </summary>
public sealed class LoginResponse
{
    public Guid UserId { get; set; }
    public Guid ClinicId { get; set; }
    public string UserName { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string Token { get; set; } = null!;
}

/// <summary>
/// DTO for creating a new user.
/// </summary>
public sealed class CreateUserRequest
{
    public string UserName { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? FullName { get; set; }
    public string Role { get; set; } = null!;
}

/// <summary>
/// DTO for user response.
/// </summary>
public sealed class UserResponse
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = null!;
    public string? FullName { get; set; }
    public string Role { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}