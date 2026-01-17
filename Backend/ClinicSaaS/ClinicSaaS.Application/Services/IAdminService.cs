using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Shared.Results;

namespace ClinicSaaS.Application.Services;

/// <summary>
/// Admin service interface for clinic management.
/// </summary>
public interface IAdminService
{
    /// <summary>
    /// Creates a new room.
    /// </summary>
    Task<Result<RoomResponse>> CreateRoomAsync(CreateRoomRequest request, Guid clinicId, Guid createdBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all rooms for a clinic.
    /// </summary>
    Task<Result<IEnumerable<RoomResponse>>> GetRoomsAsync(Guid clinicId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates an insurance company.
    /// </summary>
    Task<Result<InsuranceCompanyResponse>> CreateInsuranceCompanyAsync(CreateInsuranceCompanyRequest request, Guid clinicId, Guid createdBy, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all insurance companies for a clinic.
    /// </summary>
    Task<Result<IEnumerable<InsuranceCompanyResponse>>> GetInsuranceCompaniesAsync(Guid clinicId, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for creating a room.
/// </summary>
public sealed class CreateRoomRequest
{
    public string Name { get; set; } = null!;
}

/// <summary>
/// DTO for room response.
/// </summary>
public sealed class RoomResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}