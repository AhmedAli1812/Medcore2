using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicSaaS.Application.DTOs.Room;

/// <summary>
/// Response DTO for room information.
/// </summary>
public class RoomResponse
{
    /// <summary>
    /// Gets or sets the unique identifier of the room.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the room.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the room.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the room number.
    /// </summary>
    public string? RoomNumber { get; set; }

    /// <summary>
    /// Gets or sets the capacity of the room.
    /// </summary>
    public int Capacity { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the room is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
