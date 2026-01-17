using System.Text;
using ClinicSaaS.API.Middleware;
using ClinicSaaS.Application;
using ClinicSaaS.Infrastructure;
using ClinicSaaS.Infrastructure.Persistence;
using ClinicSaaS.Shared.Security;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;



var builder = WebApplication.CreateBuilder(args);

// Configuration for JWT
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// Add HttpContextAccessor for tenant resolution
builder.Services.AddHttpContextAccessor();

// Add services to the container.
builder.Services.AddControllers()
    .AddFluentValidation(config =>
    {
        config.RegisterValidatorsFromAssemblyContaining<Program>();
        config.DisableDataAnnotationsValidation = false;
    });

// Infrastructure registration
builder.Services.AddInfrastructure(builder.Configuration);

// Application registration
builder.Services.AddApplication();

// Authentication - JWT
var jwtOptions = new JwtOptions();
builder.Configuration.GetSection("Jwt").Bind(jwtOptions);
var key = Encoding.UTF8.GetBytes(jwtOptions.Secret ?? throw new InvalidOperationException("JWT secret not configured"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtOptions.Issuer,
        ValidAudience = jwtOptions.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

// Authorization - role-based
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"));

    options.AddPolicy("Reception", policy =>
        policy.RequireRole("Reception", "Admin"));

    options.AddPolicy("Doctor", policy =>
        policy.RequireRole("Doctor", "Admin"));

    options.AddPolicy("Accountant", policy =>
        policy.RequireRole("Accountant", "Admin"));

    options.AddPolicy("ContractManager", policy =>
        policy.RequireRole("ContractManager", "Admin"));
});

// Swagger with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ClinicSaaS API",
        Version = "v1",
        Description = "Multi-tenant Clinic Management System API",
        Contact = new OpenApiContact
        {
            Name = "Support",
            Email = "support@clinicsaas.com"
        }
    });

    // Enable sending JWT bearer token from Swagger UI
    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        Description = "Enter JWT token",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>() }
    });

    // Add XML documentation if available
    var xmlPath = Path.Combine(AppContext.BaseDirectory, "ClinicSaaS.API.xml");
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ClinicSaaS API v1");
        c.RoutePrefix = string.Empty;
    });
}

// Global exception handling
app.UseGlobalExceptionHandler();

app.UseHttpsRedirection();

app.UseAuthentication();

// Tenant middleware must run after Authentication but before Authorization
app.UseMiddleware<TenantMiddleware>();

app.UseAuthorization();

app.MapControllers();

// Health check endpoint (no auth required)
app.MapGet("/health", () =>
    Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("Health")
    .WithOpenApi()
    .AllowAnonymous();

// Seed database on startup
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
        await DbContextSeed.SeedAsync(context);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Run();