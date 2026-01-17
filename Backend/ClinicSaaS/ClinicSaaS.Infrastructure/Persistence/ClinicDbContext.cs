using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicSaaS.Infrastructure.Persistence;

public sealed class ClinicDbContext : DbContext
{
    private Guid? _currentClinicId;
    private Guid? _currentUserId;

    // Constructor الوحيد المسموح
    public ClinicDbContext(DbContextOptions<ClinicDbContext> options)
        : base(options)
    {
    }

    // Method علشان نحقن القيم بعد إنشاء الكونتكست
    public void SetCurrentContext(Guid? clinicId, Guid? userId)
    {
        _currentClinicId = clinicId;
        _currentUserId = userId;
    }

    public DbSet<Clinic> Clinics => Set<Clinic>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<InsuranceCompany> InsuranceCompanies => Set<InsuranceCompany>();
    public DbSet<Payment> Payments => Set<Payment>();

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditFields();
        return await base.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    public override int SaveChanges()
    {
        ApplyAuditFields();
        return base.SaveChanges();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var baseEntityType = typeof(BaseEntity);
        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
                     .Where(e => e.ClrType.IsAssignableTo(baseEntityType)))
        {
            var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType);
            var deletedProperty = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
            var deletedFilter = System.Linq.Expressions.Expression.Lambda(
                System.Linq.Expressions.Expression.Equal(
                    deletedProperty,
                    System.Linq.Expressions.Expression.Constant(false)),
                parameter);

            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(deletedFilter);
        }

        modelBuilder.Entity<Clinic>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).IsRequired().HasMaxLength(200);
            b.Property(x => x.Email).HasMaxLength(200);
            b.Property(x => x.Phone).HasMaxLength(20);
        });

        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.UserName).IsRequired().HasMaxLength(200);
            b.Property(x => x.PasswordHash).IsRequired();
            b.Property(x => x.FullName).HasMaxLength(200);
            b.HasIndex(x => new { x.ClinicId, x.UserName }).IsUnique();
        });

        modelBuilder.Entity<Doctor>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.FullName).IsRequired().HasMaxLength(200);
            b.Property(x => x.Specialty).HasMaxLength(200);
            b.Property(x => x.Code).HasMaxLength(50);
            b.HasIndex(x => new { x.ClinicId, x.Code });
            b.HasIndex(x => x.ClinicId);
        });

        modelBuilder.Entity<Patient>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.FullName).IsRequired().HasMaxLength(200);
            b.Property(x => x.Phone).HasMaxLength(20);
            b.HasIndex(x => x.ClinicId);
        });

        modelBuilder.Entity<Room>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).IsRequired().HasMaxLength(100);
            b.HasIndex(x => x.ClinicId);
        });

        modelBuilder.Entity<InsuranceCompany>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).IsRequired().HasMaxLength(200);
            b.HasIndex(x => x.ClinicId);
        });

        modelBuilder.Entity<Visit>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
            b.Property(x => x.PatientPaid).HasColumnType("decimal(18,2)");
            b.Property(x => x.InsuranceDue).HasColumnType("decimal(18,2)");
            b.HasIndex(x => new { x.ClinicId, x.CreatedAt });
            b.HasIndex(x => x.PatientId);
            b.HasIndex(x => x.DoctorId);
            b.HasIndex(x => x.RoomId);
            b.HasIndex(x => x.ClinicId);
        });

        modelBuilder.Entity<Payment>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            b.HasIndex(x => new { x.ClinicId, x.CreatedAt });
            b.HasIndex(x => x.VisitId);
            b.HasIndex(x => x.ClinicId);
        });
    }

    private void ApplyAuditFields()
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.CreatedBy = _currentUserId;
                entry.Entity.UpdatedAt = null;
                entry.Entity.UpdatedBy = null;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedBy = _currentUserId;
                entry.Property(nameof(BaseEntity.CreatedAt)).IsModified = false;
                entry.Property(nameof(BaseEntity.CreatedBy)).IsModified = false;
            }
        }
    }
}
