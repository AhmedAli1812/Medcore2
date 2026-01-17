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
/// Contract/Insurance service implementation for Contract Managers.
/// </summary>
public sealed class ContractService : IContractService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ContractService> _logger;

    public ContractService(IUnitOfWork unitOfWork, ILogger<ContractService> logger)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<IEnumerable<InsuranceCompanyResponse>>> GetInsuranceCompaniesAsync(
        Guid clinicId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var companies = await _unitOfWork.InsuranceCompanies.GetAsync(
                x => true,
                cancellationToken);

            companies = companies
                .OrderBy(x => x.Name)
                .ToList();

            var response = companies.Select(c => new InsuranceCompanyResponse
            {
                Id = c.Id,
                Name = c.Name,
                CreatedAt = c.CreatedAt
            });

            return Result<IEnumerable<InsuranceCompanyResponse>>
                .Ok(response, "Insurance companies retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving insurance companies for clinic {ClinicId}", clinicId);
            return Result<IEnumerable<InsuranceCompanyResponse>>
                .Fail("An error occurred while retrieving insurance companies.");
        }
    }

    public async Task<Result<IEnumerable<InsuranceClaimsSummary>>> GetInsuranceClaimsSummaryAsync(
        Guid clinicId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var companies = await _unitOfWork.InsuranceCompanies.GetAsync(
                x => true,
                cancellationToken);

            companies = companies
                .OrderBy(x => x.Name)
                .ToList();

            var summaries = new List<InsuranceClaimsSummary>();

            foreach (var company in companies)
            {
                var claims = await _unitOfWork.Visits.GetAsync(
                    v => v.PaymentType == PaymentType.Insurance,
                    cancellationToken);

                var totalDue = claims.Sum(c => c.InsuranceDue);

                var payments = await _unitOfWork.Payments.GetAsync(
                    p => claims.Select(c => c.Id).Contains(p.VisitId),
                    cancellationToken);

                var totalPaid = payments.Sum(p => p.Amount);

                summaries.Add(new InsuranceClaimsSummary
                {
                    CompanyId = company.Id,
                    CompanyName = company.Name,
                    TotalDue = totalDue,
                    TotalPaid = totalPaid,
                    Outstanding = totalDue - totalPaid
                });
            }

            return Result<IEnumerable<InsuranceClaimsSummary>>
                .Ok(summaries, "Claims summary retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving claims summary for clinic {ClinicId}", clinicId);
            return Result<IEnumerable<InsuranceClaimsSummary>>
                .Fail("An error occurred while retrieving claims summary.");
        }
    }

    public async Task<Result<InsuranceClaimsSummary>> GetInsuranceCompanyClaimsAsync(
        Guid companyId,
        Guid clinicId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var company = await _unitOfWork.InsuranceCompanies
                .GetByIdAsync(companyId, cancellationToken);

            if (company is null)
            {
                return Result<InsuranceClaimsSummary>.Fail("Insurance company not found.");
            }

            var claims = await _unitOfWork.Visits.GetAsync(
                v => v.PaymentType == PaymentType.Insurance,
                cancellationToken);

            var totalDue = claims.Sum(c => c.InsuranceDue);

            var payments = await _unitOfWork.Payments.GetAsync(
                p => claims.Select(c => c.Id).Contains(p.VisitId),
                cancellationToken);

            var totalPaid = payments.Sum(p => p.Amount);

            var summary = new InsuranceClaimsSummary
            {
                CompanyId = company.Id,
                CompanyName = company.Name,
                TotalDue = totalDue,
                TotalPaid = totalPaid,
                Outstanding = totalDue - totalPaid
            };

            return Result<InsuranceClaimsSummary>
                .Ok(summary, "Claims retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving claims for company {CompanyId}", companyId);
            return Result<InsuranceClaimsSummary>
                .Fail("An error occurred while retrieving claims.");
        }
    }
}
