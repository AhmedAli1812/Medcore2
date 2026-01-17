using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Domain.Enums;
using ClinicSaaS.Domain.Interfaces;
using ClinicSaaS.Shared.Results;
using Microsoft.Extensions.Logging;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Accountant service implementation for financial reporting.
/// </summary>
public sealed class AccountantService : IAccountantService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AccountantService> _logger;

    public AccountantService(IUnitOfWork unitOfWork, ILogger<AccountantService> logger)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<DailyIncomeSummary>> GetDailyIncomeAsync(
        Guid clinicId,
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var dayStart = date.Date;
            var dayEnd = dayStart.AddDays(1).AddTicks(-1);

            var visits = await _unitOfWork.Visits.GetAsync(
                x => x.CreatedAt >= dayStart && x.CreatedAt <= dayEnd,
                cancellationToken);

            var cashIncome = visits
                .Where(x => x.PaymentType == PaymentType.Cash)
                .Sum(x => x.PatientPaid);

            var insuranceIncome = visits
                .Where(x => x.PaymentType == PaymentType.Insurance)
                .Sum(x => x.PatientPaid);

            var summary = new DailyIncomeSummary
            {
                Date = date.Date,
                CashIncome = cashIncome,
                InsuranceIncome = insuranceIncome,
                TotalIncome = cashIncome + insuranceIncome
            };

            return Result<DailyIncomeSummary>.Ok(summary, "Daily income retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving daily income for {Date}", date);
            return Result<DailyIncomeSummary>.Fail("An error occurred while retrieving daily income.");
        }
    }

    public async Task<Result<IEnumerable<DailyIncomeSummary>>> GetDateRangeIncomeAsync(
        Guid clinicId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var visits = await _unitOfWork.Visits.GetAsync(
                x => x.CreatedAt >= startDate && x.CreatedAt <= endDate,
                cancellationToken);

            var groupedByDate = visits
                .GroupBy(x => x.CreatedAt.Date)
                .Select(g => new DailyIncomeSummary
                {
                    Date = g.Key,
                    CashIncome = g.Where(x => x.PaymentType == PaymentType.Cash).Sum(x => x.PatientPaid),
                    InsuranceIncome = g.Where(x => x.PaymentType == PaymentType.Insurance).Sum(x => x.PatientPaid),
                    TotalIncome = g.Sum(x => x.PatientPaid)
                })
                .OrderBy(x => x.Date)
                .ToList();

            return Result<IEnumerable<DailyIncomeSummary>>.Ok(groupedByDate, "Income data retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error retrieving income for date range {StartDate} to {EndDate}",
                startDate,
                endDate);

            return Result<IEnumerable<DailyIncomeSummary>>.Fail("An error occurred while retrieving income data.");
        }
    }

    public async Task<Result<IEnumerable<DoctorRevenueDto>>> GetDoctorRevenuesAsync(
        Guid clinicId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var doctors = await _unitOfWork.Doctors.GetAsync(x => true, cancellationToken);

            var revenues = new List<DoctorRevenueDto>();

            foreach (var doctor in doctors)
            {
                var visits = await _unitOfWork.Visits.GetAsync(
                    x => x.DoctorId == doctor.Id &&
                         x.CreatedAt >= startDate &&
                         x.CreatedAt <= endDate,
                    cancellationToken);

                revenues.Add(new DoctorRevenueDto
                {
                    DoctorId = doctor.Id,
                    DoctorName = doctor.FullName,
                    VisitCount = visits.Count,
                    TotalRevenue = visits.Sum(x => x.PatientPaid)
                });
            }

            return Result<IEnumerable<DoctorRevenueDto>>.Ok(
                revenues.OrderByDescending(x => x.TotalRevenue).ToList(),
                "Doctor revenues retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error retrieving doctor revenues for date range {StartDate} to {EndDate}",
                startDate,
                endDate);

            return Result<IEnumerable<DoctorRevenueDto>>.Fail("An error occurred while retrieving doctor revenues.");
        }
    }
}
