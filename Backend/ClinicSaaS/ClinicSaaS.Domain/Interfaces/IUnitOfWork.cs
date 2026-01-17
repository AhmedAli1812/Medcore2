using ClinicSaaS.Domain.Entities;

namespace ClinicSaaS.Domain.Interfaces;

public interface IUnitOfWork : IAsyncDisposable
{
    IRepository<Clinic> Clinics { get; }
    IRepository<User> Users { get; }
    IRepository<Doctor> Doctors { get; }
    IRepository<Patient> Patients { get; }
    IRepository<Room> Rooms { get; }
    IRepository<Visit> Visits { get; }
    IRepository<InsuranceCompany> InsuranceCompanies { get; }
    IRepository<Payment> Payments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
