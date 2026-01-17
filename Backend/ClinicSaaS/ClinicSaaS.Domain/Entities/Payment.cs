    using System;
using ClinicSaaS.Domain.Enums;

namespace ClinicSaaS.Domain.Entities;

/// <summary>
/// Payment record for a visit.
/// </summary>
public sealed class Payment : BaseEntity
{
    /// <summary>
    /// Visit foreign key.
    /// </summary>
    public Guid VisitId { get; set; }

    /// <summary>
    /// Payment type (Cash/Insurance).
    /// </summary>
    public PaymentType Type { get; set; }

    /// <summary>
    /// Amount paid now.
    /// </summary>
    public decimal Amount { get; set; }
}