using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace ClinicSaaS.Shared.Security;

/// <summary>
/// Simple JWT token generator helper used by AuthService implementations.
/// </summary>
public static class JwtHelper
{
    /// <summary>
    /// Creates a JWT token string.
    /// </summary>
    public static string CreateToken(JwtOptions options, IEnumerable<Claim> additionalClaims)
    {
        if (options.Secret is null)
        {
            throw new InvalidOperationException("JWT secret is not configured.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: options.Audience,
            claims: additionalClaims,
            expires: DateTime.UtcNow.AddMinutes(options.ExpiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}