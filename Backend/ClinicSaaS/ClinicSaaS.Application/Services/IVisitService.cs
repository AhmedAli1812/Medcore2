using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Shared.Results;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Visit service interface.
/// </summary>
public interface IVisitService
{
    /// <summary>
    /// Creates a new visit with cash/insurance calculation.
    /// </summary>
    Task<Result<VisitResponse>> CreateVisitAsync(CreateVisitRequest request, Guid clinicId, Guid createdBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a visit by ID.
    /// </summary>
    Task<Result<VisitResponse>> GetVisitAsync(Guid visitId, Guid clinicId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all visits for a clinic with pagination.
    /// </summary>
    Task<Result<IEnumerable<VisitResponse>>> GetVisitsAsync(Guid clinicId, int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates visit status.
    /// </summary>
    Task<Result<VisitResponse>> UpdateVisitStatusAsync(Guid visitId, UpdateVisitStatusRequest request, Guid clinicId, Guid updatedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Changes visit doctor or room (admin only).
    /// </summary>
    Task<Result<VisitResponse>> UpdateVisitAsync(Guid visitId, UpdateVisitRequest request, Guid clinicId, Guid updatedBy, CancellationToken cancellationToken = default);
}