using System;

namespace ClinicSaaS.Domain.Entities;

/// <summary>
/// Base class for all domain entities with audit fields and soft delete support.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// Unique identifier (GUID primary key).
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Tenant identifier for multi-tenancy.
    /// </summary>
    public Guid ClinicId { get; set; }

    /// <summary>
    /// Timestamp when entity was created (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// User ID who created the entity.
    /// </summary>
    public Guid? CreatedBy { get; set; }

    /// <summary>
    /// Timestamp when entity was last updated (UTC).
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// User ID who last updated the entity.
    /// </summary>
    public Guid? UpdatedBy { get; set; }

    /// <summary>
    /// Soft delete flag.
    /// </summary>
    public bool IsDeleted { get; set; }
}