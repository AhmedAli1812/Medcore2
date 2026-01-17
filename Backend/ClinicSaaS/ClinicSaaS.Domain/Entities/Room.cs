    using System;

namespace ClinicSaaS.Domain.Entities;

/// <summary>
/// Room used for visits.
/// </summary>
public sealed class Room : BaseEntity
{
    /// <summary>
    /// Room name or number.
    /// </summary>
    public string Name { get; set; } = null!;
}