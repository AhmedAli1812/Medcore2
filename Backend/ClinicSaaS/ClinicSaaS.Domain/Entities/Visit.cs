using System;
using ClinicSaaS.Domain.Enums;

namespace ClinicSaaS.Domain.Entities;

/// <summary>
/// Visit (appointment / encounter) record.
/// </summary>
public sealed class Visit : BaseEntity
{
    /// <summary>
    /// Patient foreign key.
    /// </summary>
    public Guid PatientId { get; set; }

    /// <summary>
    /// Doctor foreign key.
    /// </summary>
    public Guid DoctorId { get; set; }

    /// <summary>
    /// Room foreign key.
    /// </summary>
    public Guid RoomId { get; set; }

    /// <summary>
    /// Payment type.
    /// </summary>
    public PaymentType PaymentType { get; set; }

    /// <summary>
    /// Total amount for the visit.
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Amount paid by patient at visit time.
    /// </summary>
    public decimal PatientPaid { get; set; }

    /// <summary>
    /// Amount due from insurance.
    /// </summary>
    public decimal InsuranceDue { get; set; }

    /// <summary>
    /// Visit status.
    /// </summary>
    public VisitStatus Status { get; set; }
}