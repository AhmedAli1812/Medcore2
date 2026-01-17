using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using ClinicSaaS.Domain.Entities;

namespace ClinicSaaS.Infrastructure.Repositories;

/// <summary>
/// Generic repository interface for multi-tenant operations.
/// </summary>
public interface IRepository<TEntity> where TEntity : BaseEntity
{
    /// <summary>
    /// Gets all entities for the current clinic (non-deleted).
    /// </summary>
    IQueryable<TEntity> GetAll();

    /// <summary>
    /// Gets all entities including deleted ones.
    /// </summary>
    IQueryable<TEntity> GetAllIncludingDeleted();

    /// <summary>
    /// Gets a single entity by ID if it belongs to the current clinic.
    /// </summary>
    Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a single entity by predicate.
    /// </summary>
    Task<TEntity?> GetByPredicateAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new entity.
    /// </summary>
    Task AddAsync(TEntity entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds multiple entities.
    /// </summary>
    Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing entity.
    /// </summary>
    void Update(TEntity entity);

    /// <summary>
    /// Soft deletes an entity.
    /// </summary>
    void Delete(TEntity entity);

    /// <summary>
    /// Permanently deletes an entity from database.
    /// </summary>
    void HardDelete(TEntity entity);

    /// <summary>
    /// Counts entities matching the predicate.
    /// </summary>
    Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, CancellationToken cancellationToken = default);
}