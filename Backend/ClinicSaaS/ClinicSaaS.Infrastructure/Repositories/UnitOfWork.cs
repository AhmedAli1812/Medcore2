using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Domain.Entities;
using ClinicSaaS.Domain.Interfaces;
using ClinicSaaS.Infrastructure.Persistence;


namespace ClinicSaaS.Infrastructure.Repositories;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly ClinicDbContext _context;
    private readonly Guid _clinicId;

    private IRepository<Clinic>? _clinics;
    private IRepository<User>? _users;
    private IRepository<Doctor>? _doctors;
    private IRepository<Patient>? _patients;
    private IRepository<Room>? _rooms;
    private IRepository<Visit>? _visits;
    private IRepository<InsuranceCompany>? _insuranceCompanies;
    private IRepository<Payment>? _payments;

    public UnitOfWork(ClinicDbContext context, Guid clinicId)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _clinicId = clinicId;
    }

    public IRepository<Clinic> Clinics
        => _clinics ??= new Repository<Clinic>(_context, _clinicId);

    public IRepository<User> Users
        => _users ??= new Repository<User>(_context, _clinicId);

    public IRepository<Doctor> Doctors
        => _doctors ??= new Repository<Doctor>(_context, _clinicId);

    public IRepository<Patient> Patients
        => _patients ??= new Repository<Patient>(_context, _clinicId);

    public IRepository<Room> Rooms
        => _rooms ??= new Repository<Room>(_context, _clinicId);

    public IRepository<Visit> Visits
        => _visits ??= new Repository<Visit>(_context, _clinicId);

    public IRepository<InsuranceCompany> InsuranceCompanies
        => _insuranceCompanies ??= new Repository<InsuranceCompany>(_context, _clinicId);

    public IRepository<Payment> Payments
        => _payments ??= new Repository<Payment>(_context, _clinicId);

    Domain.Interfaces.IRepository<Clinic> IUnitOfWork.Clinics => throw new NotImplementedException();

    Domain.Interfaces.IRepository<User> IUnitOfWork.Users => throw new NotImplementedException();

    Domain.Interfaces.IRepository<Doctor> IUnitOfWork.Doctors => throw new NotImplementedException();

    Domain.Interfaces.IRepository<Patient> IUnitOfWork.Patients => throw new NotImplementedException();

    Domain.Interfaces.IRepository<Room> IUnitOfWork.Rooms => throw new NotImplementedException();

    Domain.Interfaces.IRepository<Visit> IUnitOfWork.Visits => throw new NotImplementedException();

    Domain.Interfaces.IRepository<InsuranceCompany> IUnitOfWork.InsuranceCompanies => throw new NotImplementedException();

    Domain.Interfaces.IRepository<Payment> IUnitOfWork.Payments => throw new NotImplementedException();

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);

    public ValueTask DisposeAsync()
        => _context.DisposeAsync();
}
