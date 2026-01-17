using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Shared.Results;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Accountant service interface for financial reporting.
/// </summary>
public interface IAccountantService
{
    /// <summary>
    /// Gets daily income for a specific date.
    /// </summary>
    Task<Result<DailyIncomeSummary>> GetDailyIncomeAsync(Guid clinicId, DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets daily income for a date range.
    /// </summary>
    Task<Result<IEnumerable<DailyIncomeSummary>>> GetDateRangeIncomeAsync(Guid clinicId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets doctor's revenue summary.
    /// </summary>
    Task<Result<IEnumerable<DoctorRevenueDto>>> GetDoctorRevenuesAsync(Guid clinicId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for doctor revenue report.
/// </summary>
public sealed class DoctorRevenueDto
{
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = null!;
    public int VisitCount { get; set; }
    public decimal TotalRevenue { get; set; }
}