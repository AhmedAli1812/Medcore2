namespace ClinicSaaS.Shared.Security;

/// <summary>
/// JWT configuration options.
/// </summary>
public sealed class JwtOptions
{
    public string? Issuer { get; set; }
    public string? Audience { get; set; }
    public string? Secret { get; set; }
    public int ExpiryMinutes { get; set; } = 60;
}