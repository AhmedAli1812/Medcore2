using System;

namespace ClinicSaaS.Domain.Entities;

/// <summary>
/// Represents a clinic (tenant) in the system.
/// </summary>
public sealed class Clinic : BaseEntity
{
    /// <summary>
    /// Human-friendly name.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Primary contact email for the clinic.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Contact phone number.
    /// </summary>
    public string? Phone { get; set; }
}