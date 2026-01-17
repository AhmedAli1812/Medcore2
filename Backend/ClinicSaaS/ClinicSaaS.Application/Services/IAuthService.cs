using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Shared.Results;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Authentication service interface.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Authenticates a user and returns a JWT token.
    /// </summary>
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, Guid clinicId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new user in the clinic.
    /// </summary>
    Task<Result<UserResponse>> CreateUserAsync(CreateUserRequest request, Guid clinicId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets user by ID.
    /// </summary>
    Task<Result<UserResponse>> GetUserAsync(Guid userId, Guid clinicId, CancellationToken cancellationToken = default);
}