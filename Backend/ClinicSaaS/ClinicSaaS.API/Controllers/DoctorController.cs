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
/// Doctor management controller.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class DoctorController : ControllerBase
{
    private readonly IDoctorService _doctorService;

    public DoctorController(IDoctorService doctorService)
    {
        _doctorService = doctorService ?? throw new ArgumentNullException(nameof(doctorService));
    }

    /// <summary>
    /// Create a new doctor (admin only).
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Result<DoctorResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateDoctorAsync(
        [FromBody] CreateDoctorRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid doctor data."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _doctorService.CreateDoctorAsync(request, clinicId, userId, cancellationToken)
            .ConfigureAwait(false);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetDoctorAsync), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Get a doctor by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Result<DoctorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDoctorAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _doctorService.GetDoctorAsync(id, clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get all doctors with pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDoctorsAsync(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest(Result.Fail("Invalid pagination parameters."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _doctorService.GetDoctorsAsync(clinicId, pageNumber, pageSize, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Update doctor information (admin only).
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Result<DoctorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateDoctorAsync(
        [FromRoute] Guid id,
        [FromBody] UpdateDoctorRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid doctor data."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _doctorService.UpdateDoctorAsync(id, request, clinicId, userId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : result.Message.Contains("not found") ? NotFound(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a doctor (soft delete, admin only).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteDoctorAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _doctorService.DeleteDoctorAsync(id, clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get doctor's revenue for a date range (accountant).
    /// </summary>
    [HttpGet("{id:guid}/revenue")]
    [Authorize(Policy = "Accountant")]
    [ProducesResponseType(typeof(Result<decimal>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetDoctorRevenueAsync(
        [FromRoute] Guid id,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        CancellationToken cancellationToken)
    {
        if (endDate < startDate)
        {
            return BadRequest(Result.Fail("End date must be after start date."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _doctorService.GetDoctorRevenueAsync(id, clinicId, startDate, endDate, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }
}