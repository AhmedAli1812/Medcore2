using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Domain.Entities;
using ClinicSaaS.Domain.Enums;
using ClinicSaaS.Domain.Interfaces;
using ClinicSaaS.Shared.Results;
using ClinicSaaS.Shared.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Authentication service implementation.
/// </summary>
public sealed class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<JwtOptions> jwtOptions, ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _jwtOptions = jwtOptions?.Value ?? throw new ArgumentNullException(nameof(jwtOptions));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, Guid clinicId, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByPredicateAsync(
                x => x.UserName == request.UserName && x.ClinicId == clinicId,
                cancellationToken).ConfigureAwait(false);

            if (user is null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login failed for user {UserName} in clinic {ClinicId}", request.UserName, clinicId);
                return Result<LoginResponse>.Fail("Invalid username or password.");
            }

            var claims = new List<System.Security.Claims.Claim>
            {
                new(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id.ToString()),
                new("clinic_id", user.ClinicId.ToString()),
                new(System.Security.Claims.ClaimTypes.Role, user.Role.ToString())
            };

            var token = JwtHelper.CreateToken(_jwtOptions, claims);

            var response = new LoginResponse
            {
                UserId = user.Id,
                ClinicId = user.ClinicId,
                UserName = user.UserName,
                FullName = user.FullName ?? user.UserName,
                Role = user.Role.ToString(),
                Token = token
            };

            _logger.LogInformation("User {UserName} logged in successfully", user.UserName);
            return Result<LoginResponse>.Ok(response, "Login successful.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user {UserName}", request.UserName);
            return Result<LoginResponse>.Fail("An error occurred during login.");
        }
    }

    public async Task<Result<UserResponse>> CreateUserAsync(CreateUserRequest request, Guid clinicId, CancellationToken cancellationToken = default)
    {
        try
        {
            var existingUser = await _unitOfWork.Users.GetByPredicateAsync(
                x => x.UserName == request.UserName && x.ClinicId == clinicId,
                cancellationToken).ConfigureAwait(false);

            if (existingUser is not null)
            {
                return Result<UserResponse>.Fail("User already exists.");
            }

            if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            {
                return Result<UserResponse>.Fail("Invalid role specified.");
            }

            var user = new User
            {
                ClinicId = clinicId,
                UserName = request.UserName,
                PasswordHash = HashPassword(request.Password),
                FullName = request.FullName,
                Role = role
            };

            await _unitOfWork.Users.AddAsync(user, cancellationToken).ConfigureAwait(false);
            await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("User {UserName} created successfully in clinic {ClinicId}", user.UserName, clinicId);
            return Result<UserResponse>.Ok(_mapper.Map<UserResponse>(user), "User created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user {UserName}", request.UserName);
            return Result<UserResponse>.Fail("An error occurred while creating the user.");
        }
    }

    public async Task<Result<UserResponse>> GetUserAsync(Guid userId, Guid clinicId, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _unitOfWork.Users.GetByPredicateAsync(
                x => x.Id == userId && x.ClinicId == clinicId,
                cancellationToken).ConfigureAwait(false);

            if (user is null)
            {
                return Result<UserResponse>.Fail("User not found.");
            }

            return Result<UserResponse>.Ok(_mapper.Map<UserResponse>(user), "User retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", userId);
            return Result<UserResponse>.Fail("An error occurred while retrieving the user.");
        }
    }

    private static string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    private static bool VerifyPassword(string password, string hash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput == hash;
    }
}