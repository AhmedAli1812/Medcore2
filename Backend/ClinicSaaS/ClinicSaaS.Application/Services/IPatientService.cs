using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Shared.Results;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Patient service interface.
/// </summary>
public interface IPatientService
{
    /// <summary>
    /// Creates a new patient.
    /// </summary>
    Task<Result<PatientResponse>> CreatePatientAsync(CreatePatientRequest request, Guid clinicId, Guid createdBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a patient by ID.
    /// </summary>
    Task<Result<PatientResponse>> GetPatientAsync(Guid patientId, Guid clinicId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all patients for a clinic with pagination.
    /// </summary>
    Task<Result<IEnumerable<PatientResponse>>> GetPatientsAsync(Guid clinicId, int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a patient.
    /// </summary>
    Task<Result<PatientResponse>> UpdatePatientAsync(Guid patientId, UpdatePatientRequest request, Guid clinicId, Guid updatedBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a patient (soft delete).
    /// </summary>
    Task<Result> DeletePatientAsync(Guid patientId, Guid clinicId, CancellationToken cancellationToken = default);
}