using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Shared.Results;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Contract/Insurance service interface for Contract Managers.
/// </summary>
public interface IContractService
{
    /// <summary>
    /// Gets all insurance companies for a clinic.
    /// </summary>
    Task<Result<IEnumerable<InsuranceCompanyResponse>>> GetInsuranceCompaniesAsync(Guid clinicId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets insurance claims summary per company.
    /// </summary>
    Task<Result<IEnumerable<InsuranceClaimsSummary>>> GetInsuranceClaimsSummaryAsync(Guid clinicId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets claims summary for a specific insurance company.
    /// </summary>
    Task<Result<InsuranceClaimsSummary>> GetInsuranceCompanyClaimsAsync(Guid companyId, Guid clinicId, CancellationToken cancellationToken = default);
}