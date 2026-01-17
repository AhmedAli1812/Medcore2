    using System;
using ClinicSaaS.Domain.Enums;

namespace ClinicSaaS.Domain.Entities;

/// <summary>
/// Application user tied to a Clinic (tenant).
/// </summary>
public sealed class User : BaseEntity
{
    /// <summary>
    /// Username / login email.
    /// </summary>
    public string UserName { get; set; } = null!;

    /// <summary>
    /// Hashed password.
    /// </summary>
    public string PasswordHash { get; set; } = null!;

    /// <summary>
    /// Display name.
    /// </summary>
    public string? FullName { get; set; }

    /// <summary>
    /// Role of the user.
    /// </summary>
    public UserRole Role { get; set; }
}