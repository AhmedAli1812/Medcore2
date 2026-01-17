    using System;
using System.Collections.Generic;
using System.Linq;

namespace ClinicSaaS.Shared.Results;

/// <summary>
/// Generic result wrapper for API responses.
/// </summary>
public sealed class Result
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public IEnumerable<string>? Errors { get; set; }

    public static Result Ok(string message = "Operation successful")
    {
        return new Result { Success = true, Message = message };
    }

    public static Result Fail(string message, IEnumerable<string>? errors = null)
    {
        return new Result { Success = false, Message = message, Errors = errors?.ToList() };
    }
}

/// <summary>
/// Generic result wrapper with data payload.
/// </summary>
public sealed class Result<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public T? Data { get; set; }
    public IEnumerable<string>? Errors { get; set; }

    public static Result<T> Ok(T data, string message = "Operation successful")
    {
        return new Result<T> { Success = true, Message = message, Data = data };
    }

    public static Result<T> Fail(string message, IEnumerable<string>? errors = null)
    {
        return new Result<T> { Success = false, Message = message, Errors = errors?.ToList() };
    }
}