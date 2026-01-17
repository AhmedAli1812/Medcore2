using ClinicSaaS.Application.Mappings;
using ClinicSaaS.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ClinicSaaS.Application;

/// <summary>
/// Application layer service registration.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds application services, validators, and AutoMapper profiles.
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(typeof(MappingProfile));

        // FluentValidation
        services.AddValidatorsFromAssemblyContaining(typeof(DependencyInjection));

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPatientService, PatientService>();
        services.AddScoped<IVisitService, VisitService>();
        services.AddScoped<IDoctorService, DoctorService>();
        services.AddScoped<IContractService, ContractService>();
        services.AddScoped<IAccountantService, AccountantService>();
        services.AddScoped<IAdminService, AdminService>();

        return services;
    }
}