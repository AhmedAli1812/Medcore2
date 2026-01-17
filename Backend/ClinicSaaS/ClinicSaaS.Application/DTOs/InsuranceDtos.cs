using System;

namespace ClinicSaaS.Application.DTOs;

/// <summary>
/// DTO for creating an insurance company.
/// </summary>
public sealed class CreateInsuranceCompanyRequest
{
    public string Name { get; set; } = null!;
}

/// <summary>
/// DTO for updating an insurance company.
/// </summary>
public sealed class UpdateInsuranceCompanyRequest
{
    public string Name { get; set; } = null!;
}

/// <summary>
/// DTO for insurance company response.
/// </summary>
public sealed class InsuranceCompanyResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for insurance claims summary.
/// </summary>
public sealed class InsuranceClaimsSummary
{
    public Guid CompanyId { get; set; }
    public string CompanyName { get; set; } = null!;
    public decimal TotalDue { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal Outstanding { get; set; }
}