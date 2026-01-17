using AutoMapper;
using ClinicSaaS.Application.DTOs;
using ClinicSaaS.Domain.Entities;
using ClinicSaaS.Application.DTOs.Room;


namespace ClinicSaaS.Application.Mappings;

/// <summary>
/// AutoMapper profile for entity to DTO mappings.
/// </summary>
public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Patient, PatientResponse>();
        CreateMap<Doctor, DoctorResponse>();
        CreateMap<User, UserResponse>();
        CreateMap<InsuranceCompany, InsuranceCompanyResponse>();
        CreateMap<Room, RoomResponse>();

        CreateMap<Visit, VisitResponse>()
            .ForMember(dest => dest.PatientName, opt => opt.Ignore())
            .ForMember(dest => dest.DoctorName, opt => opt.Ignore())
            .ForMember(dest => dest.RoomName, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.PaymentType, opt => opt.MapFrom(src => src.PaymentType.ToString()));

        CreateMap<Payment, PaymentResponse>()
            .ForMember(dest => dest.PaymentType, opt => opt.MapFrom(src => src.Type.ToString()));
    }
}