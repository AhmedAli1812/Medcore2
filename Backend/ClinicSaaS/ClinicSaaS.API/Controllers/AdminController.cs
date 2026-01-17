using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.API.Middleware;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Application.Services;
using ClinicSaaS.Shared.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ClinicSaaS.API.Controllers;

/// <summary>
/// Admin controller for clinic management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public sealed class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService ?? throw new ArgumentNullException(nameof(adminService));
    }

    /// <summary>
    /// Create a new room.
    /// </summary>
    [HttpPost("rooms")]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateRoomAsync(
        [FromBody] CreateRoomRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid room data."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _adminService.CreateRoomAsync(request, clinicId, userId, cancellationToken)
            .ConfigureAwait(false);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetRoomsAsync), result);
    }

    /// <summary>
    /// Get all rooms in the clinic.
    /// </summary>
    [HttpGet("rooms")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoomsAsync(CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _adminService.GetRoomsAsync(clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Create a new insurance company.
    /// </summary>
    [HttpPost("insurance-companies")]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateInsuranceCompanyAsync(
        [FromBody] CreateInsuranceCompanyRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid insurance company data."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _adminService.CreateInsuranceCompanyAsync(request, clinicId, userId, cancellationToken)
            .ConfigureAwait(false);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetInsuranceCompaniesAsync), result);
    }

    /// <summary>
    /// Get all insurance companies in the clinic.
    /// </summary>
    [HttpGet("insurance-companies")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInsuranceCompaniesAsync(CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _adminService.GetInsuranceCompaniesAsync(clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }
}