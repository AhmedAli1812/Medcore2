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
/// Visit (appointment) management controller.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class VisitController : ControllerBase
{
    private readonly IVisitService _visitService;

    public VisitController(IVisitService visitService)
    {
        _visitService = visitService ?? throw new ArgumentNullException(nameof(visitService));
    }

    /// <summary>
    /// Create a new visit (reception staff).
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "Reception")]
    [ProducesResponseType(typeof(Result<VisitResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateVisitAsync(
        [FromBody] CreateVisitRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid visit data."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _visitService.CreateVisitAsync(request, clinicId, userId, cancellationToken)
            .ConfigureAwait(false);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetVisitAsync), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Get a visit by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Result<VisitResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVisitAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _visitService.GetVisitAsync(id, clinicId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get all visits with pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVisitsAsync(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (pageNumber < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest(Result.Fail("Invalid pagination parameters."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;

        var result = await _visitService.GetVisitsAsync(clinicId, pageNumber, pageSize, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Update visit status (doctor or reception).
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "Doctor")]
    [ProducesResponseType(typeof(Result<VisitResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateVisitStatusAsync(
        [FromRoute] Guid id,
        [FromBody] UpdateVisitStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid status data."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _visitService.UpdateVisitStatusAsync(id, request, clinicId, userId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : result.Message.Contains("not found") ? NotFound(result) : BadRequest(result);
    }

    /// <summary>
    /// Update visit (change doctor or room, admin only).
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Result<VisitResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateVisitAsync(
        [FromRoute] Guid id,
        [FromBody] UpdateVisitRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(Result.Fail("Invalid visit data."));
        }

        var clinicId = HttpContext.GetClinicId() ?? Guid.Empty;
        var userId = HttpContext.GetUserId() ?? Guid.Empty;

        var result = await _visitService.UpdateVisitAsync(id, request, clinicId, userId, cancellationToken)
            .ConfigureAwait(false);

        return result.Success ? Ok(result) : result.Message.Contains("not found") ? NotFound(result) : BadRequest(result);
    }
}