# Contributing to ClinicSaaS

## Overview
Welcome — thank you for contributing. This document defines mandatory guidelines contributors must follow.

## Setup
- Use Visual Studio 2022 or later.
- Ensure .NET 9 SDK is installed.
- Run `dotnet restore` at solution root.

## Branching
- Use `main` for production-ready code.
- Use `feature/<ticket-number>-short-description` for features.
- Use `hotfix/<ticket-number>` for urgent fixes.

## Commits
- Use imperative present tense: "Add", "Fix", "Remove".
- Include ticket ID when available: `AB-123: Fix login issue`.

## Pull Requests
- Target `main` or the appropriate integration branch.
- Provide summary, testing steps, and screenshots if applicable.
- At least one approving review required.
- CI must pass before merge.

## Coding Standards
- Follow rules in `.editorconfig` (4 spaces indentation, file-scoped namespaces, nullable enabled).
- Public APIs must have XML documentation.
- Async methods must end with `Async`.
- Use AutoMapper for DTO mapping.
- Follow SOLID principles.

## Testing
- Unit tests required for business logic; prefer xUnit.
- Aim for meaningful coverage on critical paths.
- Run tests locally with `dotnet test`.

## Database Migrations
- Use EF Core Migrations in `ClinicSaaS.Infrastructure`.
- Add migrations per feature branch.

## CI/CD
- Ensure build, tests, and lint run on every PR.

## Security
- Do not commit secrets.
- Use user-secrets or environment variables for local development.

## Code Reviews
- Review for correctness, security, and maintainability.
- Suggest improvements via PR comments.

## Licensing
- Project uses MIT license.

## Contact
- For process questions, open an issue or contact the maintainers.