using System;
using ClinicSaaS.Domain.Interfaces;
using ClinicSaaS.Infrastructure.Persistence;
using ClinicSaaS.Infrastructure.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ClinicSaaS.Infrastructure;

/// <summary>
/// Infrastructure service registration.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds infrastructure services including DbContext and repositories.
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not configured.");

        // DbContext
        services.AddDbContext<ClinicDbContext>(options =>
        {
            options.UseSqlServer(connectionString, b =>
                b.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName));
        });

        // لازم دي قبل استخدام IHttpContextAccessor
        services.AddHttpContextAccessor();

        // Register UnitOfWork as scoped (will be resolved with ClinicId from HttpContext)
        services.AddScoped<IUnitOfWork>(provider =>
        {
            var context = provider.GetRequiredService<ClinicDbContext>();
            var httpContextAccessor = provider.GetRequiredService<IHttpContextAccessor>();

            var clinicId = httpContextAccessor.HttpContext?.Items["ClinicId"] as Guid?
                           ?? Guid.Empty;

            return new UnitOfWork(context, clinicId);
        });

        return services;
    }
}
