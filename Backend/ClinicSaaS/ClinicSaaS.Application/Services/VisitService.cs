using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Domain.Entities;
using ClinicSaaS.Domain.Enums;
using ClinicSaaS.Domain.Interfaces;
using ClinicSaaS.Shared.Results;
using Microsoft.Extensions.Logging;

namespace ClinicSaaS.Application.Services;

public sealed class VisitService : IVisitService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<VisitService> _logger;

    public VisitService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<VisitService> logger)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<VisitResponse>> CreateVisitAsync(
        CreateVisitRequest request,
        Guid clinicId,
        Guid createdBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var patient = await _unitOfWork.Patients.GetByIdAsync(request.PatientId, cancellationToken);
            if (patient is null)
                return Result<VisitResponse>.Fail("Patient not found.");

            var doctor = await _unitOfWork.Doctors.GetByIdAsync(request.DoctorId, cancellationToken);
            if (doctor is null)
                return Result<VisitResponse>.Fail("Doctor not found.");

            var room = await _unitOfWork.Rooms.GetByIdAsync(request.RoomId, cancellationToken);
            if (room is null)
                return Result<VisitResponse>.Fail("Room not found.");

            if (!Enum.TryParse<PaymentType>(request.PaymentType, true, out var paymentType))
                return Result<VisitResponse>.Fail("Invalid payment type.");

            var insuranceDue = paymentType == PaymentType.Insurance
                ? request.TotalAmount - request.PatientPaid
                : 0;

            var visit = new Visit
            {
                ClinicId = clinicId,
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                RoomId = request.RoomId,
                PaymentType = paymentType,
                TotalAmount = request.TotalAmount,
                PatientPaid = request.PatientPaid,
                InsuranceDue = insuranceDue,
                Status = VisitStatus.Waiting,
                CreatedBy = createdBy
            };

            await _unitOfWork.Visits.AddAsync(visit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<VisitResponse>.Ok(
                await MapVisitToResponseAsync(visit, cancellationToken),
                "Visit created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating visit");
            return Result<VisitResponse>.Fail("An error occurred while creating the visit.");
        }
    }

    public async Task<Result<VisitResponse>> GetVisitAsync(
        Guid visitId,
        Guid clinicId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var visit = await _unitOfWork.Visits.GetByIdAsync(visitId, cancellationToken);
            if (visit is null)
                return Result<VisitResponse>.Fail("Visit not found.");

            return Result<VisitResponse>.Ok(
                await MapVisitToResponseAsync(visit, cancellationToken),
                "Visit retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving visit {VisitId}", visitId);
            return Result<VisitResponse>.Fail("An error occurred while retrieving the visit.");
        }
    }

    // التعديل الأساسي هنا
    public async Task<Result<IEnumerable<VisitResponse>>> GetVisitsAsync(
        Guid clinicId,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var visits = await _unitOfWork.Visits.GetAsync(x => true, cancellationToken);

            visits = visits
                .OrderByDescending(x => x.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var responses = new List<VisitResponse>();
            foreach (var visit in visits)
            {
                responses.Add(await MapVisitToResponseAsync(visit, cancellationToken));
            }

            return Result<IEnumerable<VisitResponse>>.Ok(responses, "Visits retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving visits for clinic {ClinicId}", clinicId);
            return Result<IEnumerable<VisitResponse>>.Fail("An error occurred while retrieving visits.");
        }
    }

    public async Task<Result<VisitResponse>> UpdateVisitStatusAsync(
        Guid visitId,
        UpdateVisitStatusRequest request,
        Guid clinicId,
        Guid updatedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var visit = await _unitOfWork.Visits.GetByIdAsync(visitId, cancellationToken);
            if (visit is null)
                return Result<VisitResponse>.Fail("Visit not found.");

            if (!Enum.TryParse<VisitStatus>(request.Status, true, out var status))
                return Result<VisitResponse>.Fail("Invalid visit status.");

            visit.Status = status;
            visit.UpdatedBy = updatedBy;

            _unitOfWork.Visits.Update(visit);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<VisitResponse>.Ok(
                await MapVisitToResponseAsync(visit, cancellationToken),
                "Visit status updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating visit status");
            return Result<VisitResponse>.Fail("An error occurred while updating the visit status.");
        }
    }

    public async Task<Result<VisitResponse>> UpdateVisitAsync(
        Guid visitId,
        UpdateVisitRequest request,
        Guid clinicId,
        Guid updatedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var visit = await _unitOfWork.Visits.GetByIdAsync(visitId, cancellationToken);
            if (visit is null)
                return Result<VisitResponse>.Fail("Visit not found.");

            if (request.DoctorId.HasValue)
            {
                var doctor = await _unitOfWork.Doctors.GetByIdAsync(request.DoctorId.Value, cancellationToken);
                if (doctor is null)
                    return Result<VisitResponse>.Fail("Doctor not found.");

                visit.DoctorId = request.DoctorId.Value;
            }

            if (request.RoomId.HasValue)
            {
                var room = await _unitOfWork.Rooms.GetByIdAsync(request.RoomId.Value, cancellationToken);
                if (room is null)
                    return Result<VisitResponse>.Fail("Room not found.");

                visit.RoomId = request.RoomId.Value;
            }

            visit.UpdatedBy = updatedBy;

            _unitOfWork.Visits.Update(visit);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<VisitResponse>.Ok(
                await MapVisitToResponseAsync(visit, cancellationToken),
                "Visit updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating visit");
            return Result<VisitResponse>.Fail("An error occurred while updating the visit.");
        }
    }

    private async Task<VisitResponse> MapVisitToResponseAsync(
        Visit visit,
        CancellationToken cancellationToken)
    {
        var patient = await _unitOfWork.Patients.GetByIdAsync(visit.PatientId, cancellationToken);
        var doctor = await _unitOfWork.Doctors.GetByIdAsync(visit.DoctorId, cancellationToken);
        var room = await _unitOfWork.Rooms.GetByIdAsync(visit.RoomId, cancellationToken);

        var response = _mapper.Map<VisitResponse>(visit);
        response.PatientName = patient?.FullName ?? "Unknown";
        response.DoctorName = doctor?.FullName ?? "Unknown";
        response.RoomName = room?.Name ?? "Unknown";

        return response;
    }
}
