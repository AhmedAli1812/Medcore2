using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ClinicSaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using ClinicSaaS.Infrastructure.Persistence;


namespace ClinicSaaS.Infrastructure.Repositories;

/// <summary>
/// Generic repository implementation with multi-tenant ClinicId isolation.
/// </summary>
public sealed class Repository<TEntity> : IRepository<TEntity> where TEntity : BaseEntity
{
    private readonly ClinicDbContext _context;
    private readonly Guid _clinicId;

    public Repository(ClinicDbContext context, Guid clinicId)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _clinicId = clinicId;
    }

    public IQueryable<TEntity> GetAll()
    {
        return _context.Set<TEntity>()
            .Where(x => x.ClinicId == _clinicId && !x.IsDeleted)
            .AsNoTracking();
    }

    public IQueryable<TEntity> GetAllIncludingDeleted()
    {
        return _context.Set<TEntity>()
            .Where(x => x.ClinicId == _clinicId)
            .IgnoreQueryFilters()
            .AsNoTracking();
    }

    public async Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<TEntity>()
            .FirstOrDefaultAsync(x => x.Id == id && x.ClinicId == _clinicId && !x.IsDeleted, cancellationToken)
            .ConfigureAwait(false);
    }

    public async Task<TEntity?> GetByPredicateAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
    {
        var clinicFilter = Expression.Lambda<Func<TEntity, bool>>(
            Expression.AndAlso(
                Expression.Equal(
                    Expression.Property(Expression.Parameter(typeof(TEntity)), nameof(BaseEntity.ClinicId)),
                    Expression.Constant(_clinicId)),
                predicate.Body),
            predicate.Parameters);

        return await _context.Set<TEntity>()
            .FirstOrDefaultAsync(clinicFilter, cancellationToken)
            .ConfigureAwait(false);
    }

    public async Task AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        entity.ClinicId = _clinicId;
        await _context.Set<TEntity>().AddAsync(entity, cancellationToken).ConfigureAwait(false);
    }

    public async Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
    {
        var enumerable = entities.ToList();
        foreach (var entity in enumerable)
        {
            entity.ClinicId = _clinicId;
        }

        await _context.Set<TEntity>().AddRangeAsync(enumerable, cancellationToken).ConfigureAwait(false);
    }

    public void Update(TEntity entity)
    {
        if (entity.ClinicId != _clinicId)
        {
            throw new UnauthorizedAccessException($"Cannot update entity from different clinic: {entity.ClinicId}");
        }

        _context.Set<TEntity>().Update(entity);
    }

    public void Delete(TEntity entity)
    {
        if (entity.ClinicId != _clinicId)
        {
            throw new UnauthorizedAccessException($"Cannot delete entity from different clinic: {entity.ClinicId}");
        }

        entity.IsDeleted = true;
        _context.Set<TEntity>().Update(entity);
    }

    public void HardDelete(TEntity entity)
    {
        if (entity.ClinicId != _clinicId)
        {
            throw new UnauthorizedAccessException($"Cannot delete entity from different clinic: {entity.ClinicId}");
        }

        _context.Set<TEntity>().Remove(entity);
    }

    public async Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Set<TEntity>().Where(x => x.ClinicId == _clinicId && !x.IsDeleted);

        if (predicate is not null)
        {
            query = query.Where(predicate);
        }

        return await query.CountAsync(cancellationToken).ConfigureAwait(false);
    }
}