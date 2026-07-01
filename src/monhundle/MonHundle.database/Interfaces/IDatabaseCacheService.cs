using MonHundle.database.enums;

namespace MonHundle.domain.Interfaces.Services;

public interface IDatabaseCacheService
{
    IReadOnlyCollection<string> GetAvailableTables();
    void InvalidateAll();
    void InvalidateTables(params CachedTables[] tables);
    bool TryInvalidateTables(IEnumerable<string> keys, out IEnumerable<string> invalidKeys);
}