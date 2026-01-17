using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.API.Middleware;
using ClinicSaaS.Application.Services;
using ClinicSaaS.Shared.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ClinicSaaS.API.Controllers;

/// <summary>
/// Contract/Insurance management controller for Contract Managers.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "ContractManager")]
public sealed class ContractController : ControllerBase
{
    private readonly IContractService _contractService;

    public ContractController(IContractService contractService)
    {
        _contractService = contractService ?? throw new ArgumentNullException(nameof(contractService));
    }

    /// <summary>
    /// Get all insurance companies for the clinic.
    /// </summary>
    [HttpGet("insurance-companies")]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetInsuranceCompaniesAsync(CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _contractService.GetInsuranceCompaniesAsync(clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get insurance claims summary for all companies.
    /// </summary>
    [HttpGet("claims-summary")]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetClaimsSummaryAsync(CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _contractService.GetInsuranceClaimsSummaryAsync(clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get claims summary for a specific insurance company.
    /// </summary>
    [HttpGet("claims-summary/{companyId:guid}")]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCompanyClaimsAsync(
        [FromRoute] Guid companyId,
        CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _contractService.GetInsuranceCompanyClaimsAsync(companyId, clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : NotFound(result);
    }
}