using ClinicSaaS.Application.DTOs;
using FluentValidation;

namespace ClinicSaaS.Application.Validators;

/// <summary>
/// Validator for creating patients.
/// </summary>
public sealed class CreatePatientValidator : AbstractValidator<CreatePatientRequest>
{
    public CreatePatientValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Patient name is required.")
            .MaximumLength(200).WithMessage("Patient name must not exceed 200 characters.");

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters.")
            .Matches(@"^\d+$").When(x => !string.IsNullOrEmpty(x.Phone)).WithMessage("Phone must contain only digits.");

        RuleFor(x => x.DateOfBirth)
            .LessThan(System.DateTime.Today).WithMessage("Date of birth must be in the past.")
            .When(x => x.DateOfBirth.HasValue);
    }
}