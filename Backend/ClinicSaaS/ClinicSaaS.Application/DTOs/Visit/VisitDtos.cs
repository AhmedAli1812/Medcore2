using System;

namespace ClinicSaaS.Application.DTOs;

/// <summary>
/// DTO for creating a visit.
/// </summary>
public sealed class CreateVisitRequest
{
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public Guid RoomId { get; set; }
    public string PaymentType { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public decimal PatientPaid { get; set; }
}

/// <summary>
/// DTO for updating visit status.
/// </summary>
public sealed class UpdateVisitStatusRequest
{
    public string Status { get; set; } = null!;
}

/// <summary>
/// DTO for updating visit room or doctor.
/// </summary>
public sealed class UpdateVisitRequest
{
    public Guid? DoctorId { get; set; }
    public Guid? RoomId { get; set; }
}

/// <summary>
/// DTO for visit response.
/// </summary>
public sealed class VisitResponse
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = null!;
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = null!;
    public Guid RoomId { get; set; }
    public string RoomName { get; set; } = null!;
    public string PaymentType { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public decimal PatientPaid { get; set; }
    public decimal InsuranceDue { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for daily income summary.
/// </summary>
public sealed class DailyIncomeSummary
{
    public DateTime Date { get; set; }
    public decimal CashIncome { get; set; }
    public decimal InsuranceIncome { get; set; }
    public decimal TotalIncome { get; set; }
}