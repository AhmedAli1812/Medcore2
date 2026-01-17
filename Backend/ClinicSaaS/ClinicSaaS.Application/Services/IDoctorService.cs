using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Shared.Results;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Doctor service interface.
/// </summary>
public interface IDoctorService
{
    /// <summary>
    /// Creates a new doctor.
    /// </summary>
    Task<Result<DoctorResponse>> CreateDoctorAsync(CreateDoctorRequest request, Guid clinicId, Guid createdBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a doctor by ID.
    /// </summary>
    Task<Result<DoctorResponse>> GetDoctorAsync(Guid doctorId, Guid clinicId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all doctors for a clinic with pagination.
    /// </summary>
    Task<Result<IEnumerable<DoctorResponse>>> GetDoctorsAsync(Guid clinicId, int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a doctor.
    /// </summary>
    Task<Result<DoctorResponse>> UpdateDoctorAsync(Guid doctorId, UpdateDoctorRequest request, Guid clinicId, Guid updatedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a doctor (soft delete).
    /// </summary>
    Task<Result> DeleteDoctorAsync(Guid doctorId, Guid clinicId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets doctor's revenue for a date range.
    /// </summary>
    Task<Result<decimal>> GetDoctorRevenueAsync(Guid doctorId, Guid clinicId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}