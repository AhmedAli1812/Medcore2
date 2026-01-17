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
/// Accountant controller for financial reporting.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Accountant")]
public sealed class AccountantController : ControllerBase
{
    private readonly IAccountantService _accountantService;

    public AccountantController(IAccountantService accountantService)
    {
        _accountantService = accountantService ?? throw new ArgumentNullException(nameof(accountantService));
    }

    /// <summary>
    /// Get daily income for a specific date.
    /// </summary>
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetDailyIncomeAsync(
        [FromQuery] DateTime date,
        CancellationToken cancellationToken)
    {
        if (date == default)
        {
            date = DateTime.UtcNow;
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _accountantService.GetDailyIncomeAsync(clinicId, date, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get income summary for a date range.
    /// </summary>
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetDateRangeIncomeAsync(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        CancellationToken cancellationToken)
    {
        if (endDate < startDate)
        {
            return BadRequest(Result.Fail("End date must be after start date."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _accountantService.GetDateRangeIncomeAsync(clinicId, startDate, endDate, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get doctor revenues for a date range.
    /// </summary>
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetDoctorRevenuesAsync(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        CancellationToken cancellationToken)
    {
        if (endDate < startDate)
        {
            return BadRequest(Result.Fail("End date must be after start date."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _accountantService.GetDoctorRevenuesAsync(clinicId, startDate, endDate, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }
}