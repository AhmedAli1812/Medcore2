    using System;

namespace ClinicSaaS.Domain.Entities;

/// <summary>
/// Doctor entity. Doctors belong to a clinic.
/// </summary>
public sealed class Doctor : BaseEntity
{
    /// <summary>
    /// Doctor full name.
    /// </summary>
    public string FullName { get; set; } = null!;

    /// <summary>
    /// Specialty or notes.
    /// </summary>
    public string? Specialty { get; set; }

    /// <summary>
    /// External code or identifier.
    /// </summary>
    public string? Code { get; set; }
}