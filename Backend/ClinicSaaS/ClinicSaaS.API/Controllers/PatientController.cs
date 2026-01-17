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
/// Patient management controller.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class PatientController : ControllerBase
{
    private readonly IPatientService _patientService;

    public PatientController(IPatientService patientService)
    {
        _patientService = patientService ?? throw new ArgumentNullException(nameof(patientService));
    }

    /// <summary>
    /// Create a new patient (reception staff).
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "Reception")]
    [ProducesResponseType(typeof(Result<PatientResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePatientAsync(
        [FromBody] CreatePatientRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid patient data."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _patientService.CreatePatientAsync(request, clinicId, userId, cancellationToken)
            .ConfigureAwait(false);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetPatientAsync), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Get a patient by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Result<PatientResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPatientAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _patientService.GetPatientAsync(id, clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get all patients with pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPatientsAsync(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest(Result.Fail("Invalid pagination parameters."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _patientService.GetPatientsAsync(clinicId, pageNumber, pageSize, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Update patient information.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "Reception")]
    [ProducesResponseType(typeof(Result<PatientResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePatientAsync(
        [FromRoute] Guid id,
        [FromBody] UpdatePatientRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid patient data."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _patientService.UpdatePatientAsync(id, request, clinicId, userId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : result.Message.Contains("not found") ? NotFound(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a patient (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeletePatientAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _patientService.DeletePatientAsync(id, clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : NotFound(result);
    }
}