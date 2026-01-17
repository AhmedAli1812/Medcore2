using System;

namespace ClinicSaaS.Application.DTOs;

/// <summary>
/// DTO for creating a patient.
/// </summary>
public sealed class CreatePatientRequest
{
    public string FullName { get; set; } = null!;
    public DateTime? DateOfBirth { get; set; }
    public string? Phone { get; set; }
}

/// <summary>
/// DTO for updating a patient.
/// </summary>
public sealed class UpdatePatientRequest
{
    public string FullName { get; set; } = null!;
    public DateTime? DateOfBirth { get; set; }
    public string? Phone { get; set; }
}

/// <summary>
/// DTO for patient response.
/// </summary>
public sealed class PatientResponse
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public DateTime? DateOfBirth { get; set; }
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; }
}