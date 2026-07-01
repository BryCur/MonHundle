using EFCoreSecondLevelCacheInterceptor;
using MonHundle.database.enums;
using MonHundle.domain.Interfaces.Services;

namespace MonHundle.database.Services;

public enum DbCacheKeys
{
 
}
public class DatabaseCacheService(IEFCacheServiceProvider cacheServiceProvider) : IDatabaseCacheService
{
    public static readonly Dictionary<CachedTables, string> AvailableTables = new()
    {
        { CachedTables.Games, "Games" },
        { CachedTables.GuessableMonsters, "GuessableMonsters" },
        { CachedTables.GameSessions, "GameSessions" },
        { CachedTables.Players, "Players" },
        { CachedTables.DailyMonsters, "DailyMonsters" },
    };


    // Vue inversée pour la validation des paramètres API (clé API lowercase → enum)
    public static readonly Dictionary<string, CachedTables> KeyMap =
        AvailableTables.ToDictionary(kvp => kvp.Key.ToString().ToLower(), kvp => kvp.Key);

    
    public void InvalidateTables(params CachedTables[] tables)
    {
        var tableNames = tables.Select(t => AvailableTables[t]).ToHashSet();
        cacheServiceProvider.InvalidateCacheDependencies(new EFCacheKey(tableNames));
    }

    // Usage externe via strings (validation incluse)
    public bool TryInvalidateTables(IEnumerable<string> keys, out IEnumerable<string> invalidKeys)
    {
        var keyList = keys.Select(k => k.ToLower()).ToList();
        var unknownKeys = keyList.Where(k => !KeyMap.ContainsKey(k)).ToList();
        invalidKeys = unknownKeys;

        if (unknownKeys.Any())
            return false;

        InvalidateTables(keyList.Select(k => KeyMap[k]).ToArray());
        return true;
    }

    public IReadOnlyCollection<string> GetAvailableTables()
    {
        return KeyMap.Keys.ToList();
    }

    public void InvalidateAll()
    {
        cacheServiceProvider.ClearAllCachedEntries();
    }
    
}