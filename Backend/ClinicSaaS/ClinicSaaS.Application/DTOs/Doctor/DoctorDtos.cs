using System;

namespace ClinicSaaS.Application.DTOs;

/// <summary>
/// DTO for creating a doctor.
/// </summary>
public sealed class CreateDoctorRequest
{
    public string FullName { get; set; } = null!;
    public string? Specialty { get; set; }
    public string? Code { get; set; }
}

/// <summary>
/// DTO for updating a doctor.
/// </summary>
public sealed class UpdateDoctorRequest
{
    public string FullName { get; set; } = null!;
    public string? Specialty { get; set; }
    public string? Code { get; set; }
}

/// <summary>
/// DTO for doctor response.
/// </summary>
public sealed class DoctorResponse
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string? Specialty { get; set; }
    public string? Code { get; set; }
    public DateTime CreatedAt { get; set; }
}