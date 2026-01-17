    using System;

namespace ClinicSaaS.Domain.Entities;

/// <summary>
/// Insurance company entity.
/// </summary>
public sealed class InsuranceCompany : BaseEntity
{
    /// <summary>
    /// Company name.
    /// </summary>
    public string Name { get; set; } = null!;
}