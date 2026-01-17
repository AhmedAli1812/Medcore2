using System;

namespace ClinicSaaS.Application.DTOs;

/// <summary>
/// DTO for creating a payment.
/// </summary>
public sealed class CreatePaymentRequest
{
    public Guid VisitId { get; set; }
    public string PaymentType { get; set; } = null!;
    public decimal Amount { get; set; }
}

/// <summary>
/// DTO for payment response.
/// </summary>
public sealed class PaymentResponse
{
    public Guid Id { get; set; }
    public Guid VisitId { get; set; }
    public string PaymentType { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }
}