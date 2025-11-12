using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MonHundle.database.Converters;

/**
 * Force the DateTime objects to be set to UTC datetime whenever stored to DB.
 * prevents error:
 *
 * System.ArgumentException: Cannot write DateTime with Kind=Unspecified to PostgreSQL type 'timestamp with time zone', only UTC is supported
 */
public class DateTimeUtcKindConverter(): ValueConverter<DateTime, DateTime>(
    v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
    v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
{}
