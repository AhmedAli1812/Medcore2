using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicSaaS.Domain.Entities;
using ClinicSaaS.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ClinicSaaS.Infrastructure.Persistence;

/// <summary>
/// Database seed data for initial setup.
/// </summary>
public static class DbContextSeed
{
    private const string DemoClinicId = "550e8400-e29b-41d4-a716-446655440000";

    /// <summary>
    /// Seeds initial data into the database.
    /// </summary>
    public static async Task SeedAsync(ClinicDbContext context)
    {
        try
        {
            await context.Database.MigrateAsync();

            // Check if data already exists
            if (await context.Clinics.AnyAsync())
            {
                return;
            }

            var clinicId = Guid.Parse(DemoClinicId);

            // Create demo clinic
            var clinic = new Clinic
            {
                Id = clinicId,
                ClinicId = clinicId,
                Name = "Demo Clinic",
                Email = "info@democlinic.com",
                Phone = "+1-555-0100"
            };

            await context.Clinics.AddAsync(clinic);

            // Create demo users
            var adminUser = new User
            {
                ClinicId = clinicId,
                UserName = "admin",
                PasswordHash = HashPassword("admin123"),
                FullName = "Admin User",
                Role = UserRole.Admin,
                CreatedBy = null
            };

            var receptionUser = new User
            {
                ClinicId = clinicId,
                UserName = "reception",
                PasswordHash = HashPassword("reception123"),
                FullName = "Reception Staff",
                Role = UserRole.Reception,
                CreatedBy = adminUser.Id
            };

            var doctorUser = new User
            {
                ClinicId = clinicId,
                UserName = "doctor",
                PasswordHash = HashPassword("doctor123"),
                FullName = "Dr. John Smith",
                Role = UserRole.Doctor,
                CreatedBy = adminUser.Id
            };

            var accountantUser = new User
            {
                ClinicId = clinicId,
                UserName = "accountant",
                PasswordHash = HashPassword("accountant123"),
                FullName = "Accountant User",
                Role = UserRole.Accountant,
                CreatedBy = adminUser.Id
            };

            var contractUser = new User
            {
                ClinicId = clinicId,
                UserName = "contract",
                PasswordHash = HashPassword("contract123"),
                FullName = "Contract Manager",
                Role = UserRole.ContractManager,
                CreatedBy = adminUser.Id
            };

            await context.Users.AddRangeAsync(adminUser, receptionUser, doctorUser, accountantUser, contractUser);

            // Create demo doctors
            var doctors = new List<Doctor>
            {
                new Doctor
                {
                    ClinicId = clinicId,
                    FullName = "Dr. Sarah Johnson",
                    Specialty = "Cardiology",
                    Code = "DR001",
                    CreatedBy = adminUser.Id
                },
                new Doctor
                {
                    ClinicId = clinicId,
                    FullName = "Dr. Michael Brown",
                    Specialty = "General Medicine",
                    Code = "DR002",
                    CreatedBy = adminUser.Id
                },
                new Doctor
                {
                    ClinicId = clinicId,
                    FullName = "Dr. Emma Davis",
                    Specialty = "Pediatrics",
                    Code = "DR003",
                    CreatedBy = adminUser.Id
                }
            };

            await context.Doctors.AddRangeAsync(doctors);

            // Create demo rooms
            var rooms = new List<Room>
            {
                new Room { ClinicId = clinicId, Name = "Room A", CreatedBy = adminUser.Id },
                new Room { ClinicId = clinicId, Name = "Room B", CreatedBy = adminUser.Id },
                new Room { ClinicId = clinicId, Name = "Room C", CreatedBy = adminUser.Id },
                new Room { ClinicId = clinicId, Name = "Emergency Room", CreatedBy = adminUser.Id }
            };

            await context.Rooms.AddRangeAsync(rooms);

            // Create demo insurance companies
            var insuranceCompanies = new List<InsuranceCompany>
            {
                new InsuranceCompany { ClinicId = clinicId, Name = "HealthCare Plus", CreatedBy = adminUser.Id },
                new InsuranceCompany { ClinicId = clinicId, Name = "MediCare Insurance", CreatedBy = adminUser.Id },
                new InsuranceCompany { ClinicId = clinicId, Name = "Global Health", CreatedBy = adminUser.Id }
            };

            await context.InsuranceCompanies.AddRangeAsync(insuranceCompanies);

            // Create demo patients
            var patients = new List<Patient>
            {
                new Patient
                {
                    ClinicId = clinicId,
                    FullName = "John Doe",
                    DateOfBirth = new DateTime(1985, 5, 15),
                    Phone = "+1-555-0101",
                    CreatedBy = receptionUser.Id
                },
                new Patient
                {
                    ClinicId = clinicId,
                    FullName = "Jane Smith",
                    DateOfBirth = new DateTime(1990, 8, 22),
                    Phone = "+1-555-0102",
                    CreatedBy = receptionUser.Id
                },
                new Patient
                {
                    ClinicId = clinicId,
                    FullName = "Robert Wilson",
                    DateOfBirth = new DateTime(1975, 3, 10),
                    Phone = "+1-555-0103",
                    CreatedBy = receptionUser.Id
                }
            };

            await context.Patients.AddRangeAsync(patients);

            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to seed database", ex);
        }
    }

    private static string HashPassword(string password)
    {
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}