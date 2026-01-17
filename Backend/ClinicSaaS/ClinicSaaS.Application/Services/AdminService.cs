using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Domain.Entities;
using ClinicSaaS.Shared.Results;
using Microsoft.Extensions.Logging;
using ClinicSaaS.Domain.Interfaces;


namespace ClinicSaaS.Application.Services;

/// <summary>
/// Admin service implementation for clinic management.
/// </summary>
public sealed class AdminService : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminService> _logger;

    public AdminService(IUnitOfWork unitOfWork, ILogger<AdminService> logger)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<Result<RoomResponse>> CreateRoomAsync(CreateRoomRequest request, Guid clinicId, Guid createdBy, CancellationToken cancellationToken = default)
    {
        try
        {
            var room = new Room
            {
                ClinicId = clinicId,
                Name = request.Name,
                CreatedBy = createdBy
            };

            await _unitOfWork.Rooms.AddAsync(room, cancellationToken).ConfigureAwait(false);
            await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("Room {RoomName} created with ID {RoomId}", room.Name, room.Id);
            return Result<RoomResponse>.Ok(new RoomResponse { Id = room.Id, Name = room.Name, CreatedAt = room.CreatedAt }, "Room created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating room {RoomName}", request.Name);
            return Result<RoomResponse>.Fail("An error occurred while creating the room.");
        }
    }

    public async Task<Result<IEnumerable<RoomResponse>>> GetRoomsAsync(Guid clinicId, CancellationToken cancellationToken = default)
    {
        try
        {
            var rooms = await _unitOfWork.Rooms.GetAsync(
             x => true,
            cancellationToken);

            rooms = rooms
                .OrderBy(x => x.Name)
                .ToList();


            var response = rooms.Select(r => new RoomResponse { Id = r.Id, Name = r.Name, CreatedAt = r.CreatedAt });
            return Result<IEnumerable<RoomResponse>>.Ok(response, "Rooms retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rooms for clinic {ClinicId}", clinicId);
            return Result<IEnumerable<RoomResponse>>.Fail("An error occurred while retrieving rooms.");
        }
    }

    public async Task<Result<InsuranceCompanyResponse>> CreateInsuranceCompanyAsync(CreateInsuranceCompanyRequest request, Guid clinicId, Guid createdBy, CancellationToken cancellationToken = default)
    {
        try
        {
            var company = new InsuranceCompany
            {
                ClinicId = clinicId,
                Name = request.Name,
                CreatedBy = createdBy
            };

            await _unitOfWork.InsuranceCompanies.AddAsync(company, cancellationToken).ConfigureAwait(false);
            await _unitOfWork.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            _logger.LogInformation("Insurance company {CompanyName} created with ID {CompanyId}", company.Name, company.Id);
            return Result<InsuranceCompanyResponse>.Ok(
                new InsuranceCompanyResponse { Id = company.Id, Name = company.Name, CreatedAt = company.CreatedAt },
                "Insurance company created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating insurance company {CompanyName}", request.Name);
            return Result<InsuranceCompanyResponse>.Fail("An error occurred while creating the insurance company.");
        }
    }

    public async Task<Result<IEnumerable<InsuranceCompanyResponse>>> GetInsuranceCompaniesAsync(Guid clinicId, CancellationToken cancellationToken = default)
    {
        try
        {
            var companies = await _unitOfWork.InsuranceCompanies.GetAsync(
             x => true,
             cancellationToken);

            companies = companies
                .OrderBy(x => x.Name)
                .ToList();


            var response = companies.Select(c => new InsuranceCompanyResponse { Id = c.Id, Name = c.Name, CreatedAt = c.CreatedAt });
            return Result<IEnumerable<InsuranceCompanyResponse>>.Ok(response, "Insurance companies retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving insurance companies for clinic {ClinicId}", clinicId);
            return Result<IEnumerable<InsuranceCompanyResponse>>.Fail("An error occurred while retrieving insurance companies.");
        }
    }
}