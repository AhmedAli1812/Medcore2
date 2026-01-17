using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Domain.Entities;
using ClinicSaaS.Domain.Interfaces;
using ClinicSaaS.Shared.Results;
using Microsoft.Extensions.Logging;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Patient service implementation.
/// </summary>
public sealed class PatientService : IPatientService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<PatientService> _logger;

    public PatientService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<PatientService> logger)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<PatientResponse>> CreatePatientAsync(
        CreatePatientRequest request,
        Guid clinicId,
        Guid createdBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var patient = new Patient
            {
                ClinicId = clinicId,
                FullName = request.FullName,
                DateOfBirth = request.DateOfBirth,
                Phone = request.Phone,
                CreatedBy = createdBy
            };

            await _unitOfWork.Patients.AddAsync(patient, cancellationToken).ConfigureAwait(false);
            await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("Patient {PatientName} created with ID {PatientId}", patient.FullName, patient.Id);
            return Result<PatientResponse>.Ok(_mapper.Map<PatientResponse>(patient), "Patient created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating patient {PatientName}", request.FullName);
            return Result<PatientResponse>.Fail("An error occurred while creating the patient.");
        }
    }

    public async Task<Result<PatientResponse>> GetPatientAsync(
        Guid patientId,
        Guid clinicId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var patient = await _unitOfWork.Patients
                .GetByIdAsync(patientId, cancellationToken)
                .ConfigureAwait(false);

            if (patient is null)
                return Result<PatientResponse>.Fail("Patient not found.");

            return Result<PatientResponse>.Ok(_mapper.Map<PatientResponse>(patient), "Patient retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving patient {PatientId}", patientId);
            return Result<PatientResponse>.Fail("An error occurred while retrieving the patient.");
        }
    }

    public async Task<Result<IEnumerable<PatientResponse>>> GetPatientsAsync(
        Guid clinicId,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // نجيب كل المرضى من الريبو
            var patients = await _unitOfWork.Patients
                .GetAsync(x => true, cancellationToken);

            // ترتيب + Pagination في الميموري
            patients = patients
                .OrderByDescending(x => x.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var response = _mapper.Map<IEnumerable<PatientResponse>>(patients);
            return Result<IEnumerable<PatientResponse>>.Ok(response, "Patients retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving patients for clinic {ClinicId}", clinicId);
            return Result<IEnumerable<PatientResponse>>.Fail("An error occurred while retrieving patients.");
        }
    }

    public async Task<Result<PatientResponse>> UpdatePatientAsync(
        Guid patientId,
        UpdatePatientRequest request,
        Guid clinicId,
        Guid updatedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var patient = await _unitOfWork.Patients
                .GetByIdAsync(patientId, cancellationToken)
                .ConfigureAwait(false);

            if (patient is null)
                return Result<PatientResponse>.Fail("Patient not found.");

            patient.FullName = request.FullName;
            patient.DateOfBirth = request.DateOfBirth;
            patient.Phone = request.Phone;
            patient.UpdatedBy = updatedBy;

            _unitOfWork.Patients.Update(patient);
            await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("Patient {PatientId} updated", patientId);
            return Result<PatientResponse>.Ok(_mapper.Map<PatientResponse>(patient), "Patient updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating patient {PatientId}", patientId);
            return Result<PatientResponse>.Fail("An error occurred while updating the patient.");
        }
    }

    public async Task<Result> DeletePatientAsync(
        Guid patientId,
        Guid clinicId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var patient = await _unitOfWork.Patients
                .GetByIdAsync(patientId, cancellationToken)
                .ConfigureAwait(false);

            if (patient is null)
                return Result.Fail("Patient not found.");

            _unitOfWork.Patients.Delete(patient);
            await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("Patient {PatientId} deleted", patientId);
            return Result.Ok("Patient deleted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting patient {PatientId}", patientId);
            return Result.Fail("An error occurred while deleting the patient.");
        }
    }
}
