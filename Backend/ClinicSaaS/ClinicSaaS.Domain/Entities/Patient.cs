    using System;

namespace ClinicSaaS.Domain.Entities;

/// <summary>
/// Patient entity.
/// </summary>
public sealed class Patient : BaseEntity
{
    /// <summary>
    /// Patient full name.
    /// </summary>
    public string FullName { get; set; } = null!;

    /// <summary>
    /// Date of birth (optional).
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Contact phone.
    /// </summary>
    public string? Phone { get; set; }
}