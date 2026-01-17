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
/// Doctor service implementation.
/// </summary>
public sealed class DoctorService : IDoctorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<DoctorService> _logger;

    public DoctorService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<DoctorService> logger)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<DoctorResponse>> CreateDoctorAsync(
        CreateDoctorRequest request,
        Guid clinicId,
        Guid createdBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var doctor = new Doctor
            {
                ClinicId = clinicId,
                FullName = request.FullName,
                Specialty = request.Specialty,
                Code = request.Code,
                CreatedBy = createdBy
            };

            await _unitOfWork.Doctors.AddAsync(doctor, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Doctor {DoctorName} created with ID {DoctorId}", doctor.FullName, doctor.Id);
            return Result<DoctorResponse>.Ok(_mapper.Map<DoctorResponse>(doctor), "Doctor created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating doctor {DoctorName}", request.FullName);
            return Result<DoctorResponse>.Fail("An error occurred while creating the doctor.");
        }
    }

    public async Task<Result<DoctorResponse>> GetDoctorAsync(
        Guid doctorId,
        Guid clinicId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(doctorId, cancellationToken);

            if (doctor is null)
                return Result<DoctorResponse>.Fail("Doctor not found.");

            return Result<DoctorResponse>.Ok(_mapper.Map<DoctorResponse>(doctor), "Doctor retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving doctor {DoctorId}", doctorId);
            return Result<DoctorResponse>.Fail("An error occurred while retrieving the doctor.");
        }
    }

    public async Task<Result<IEnumerable<DoctorResponse>>> GetDoctorsAsync(
        Guid clinicId,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // نجيب الداتا من الريبو
            var doctors = await _unitOfWork.Doctors.GetAsync(x => true, cancellationToken);

            // نعمل Pagination و Ordering في الميموري
            doctors = doctors
                .OrderBy(x => x.FullName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var response = _mapper.Map<IEnumerable<DoctorResponse>>(doctors);
            return Result<IEnumerable<DoctorResponse>>.Ok(response, "Doctors retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving doctors for clinic {ClinicId}", clinicId);
            return Result<IEnumerable<DoctorResponse>>.Fail("An error occurred while retrieving doctors.");
        }
    }

    public async Task<Result<DoctorResponse>> UpdateDoctorAsync(
        Guid doctorId,
        UpdateDoctorRequest request,
        Guid clinicId,
        Guid updatedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(doctorId, cancellationToken);

            if (doctor is null)
                return Result<DoctorResponse>.Fail("Doctor not found.");

            doctor.FullName = request.FullName;
            doctor.Specialty = request.Specialty;
            doctor.Code = request.Code;
            doctor.UpdatedBy = updatedBy;

            _unitOfWork.Doctors.Update(doctor);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Doctor {DoctorId} updated", doctorId);
            return Result<DoctorResponse>.Ok(_mapper.Map<DoctorResponse>(doctor), "Doctor updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating doctor {DoctorId}", doctorId);
            return Result<DoctorResponse>.Fail("An error occurred while updating the doctor.");
        }
    }

    public async Task<Result> DeleteDoctorAsync(
        Guid doctorId,
        Guid clinicId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(doctorId, cancellationToken);

            if (doctor is null)
                return Result.Fail("Doctor not found.");

            _unitOfWork.Doctors.Delete(doctor);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Doctor {DoctorId} deleted", doctorId);
            return Result.Ok("Doctor deleted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting doctor {DoctorId}", doctorId);
            return Result.Fail("An error occurred while deleting the doctor.");
        }
    }

    public async Task<Result<decimal>> GetDoctorRevenueAsync(
        Guid doctorId,
        Guid clinicId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // نجيب الزيارات من الريبو
            var visits = await _unitOfWork.Visits.GetAsync(
                x => x.DoctorId == doctorId &&
                     x.CreatedAt >= startDate &&
                     x.CreatedAt <= endDate,
                cancellationToken);

            // نحسب الإيراد في الميموري
            var revenue = visits.Sum(x => x.PatientPaid);

            return Result<decimal>.Ok(revenue, "Doctor revenue calculated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating doctor {DoctorId} revenue", doctorId);
            return Result<decimal>.Fail("An error occurred while calculating revenue.");
        }
    }
}
