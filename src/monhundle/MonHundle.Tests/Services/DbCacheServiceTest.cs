using System.Reflection;
using Microsoft.EntityFrameworkCore;
using MonHundle.database;
using MonHundle.database.enums;
using MonHundle.database.Services;

namespace MonHundle.Tests.Services;

/// <summary>
/// These tests ensure the logic of the DbCache fully covers the db sets available. This is to make sure that the relation
/// between the dbsets, the AvailableTables dictionary, and the CachedTables key enum are fully covered.
/// </summary>
public class DbCacheServiceTest
{
    private static IReadOnlyCollection<string> GetDbSetNames()
    {
        return typeof(AppDbContext)
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.PropertyType.IsGenericType
                     && p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>))
            .Select(p => p.Name)
            .ToList();
    }

    [Fact]
    public void all_enum_cache_keys_should_have_corresponding_dbSet()
    {
        // Arrange
        var dbSetNames = GetDbSetNames();
        var enumValues = Enum.GetValues<CachedTables>();

        // Act & Assert
        foreach (var table in enumValues)
        {
            Assert.Contains(
                table.ToString(),
                dbSetNames,
                StringComparer.OrdinalIgnoreCase
            );
        }
    }

    [Fact]
    public void all_enum_cache_keys_should_have_corresponding_cache_dict_keys()
    {
        // Vérifie que chaque valeur de l'enum a bien une entrée dans _tableMap
        // (cohérence interne de DbCacheService)
        var enumValues = Enum.GetValues<CachedTables>();
        var dbCacheDictKeys = DatabaseCacheService.AvailableTables.Keys;

        foreach (var table in enumValues)
        {
            Assert.Contains(table, dbCacheDictKeys);
        }
    }

    [Fact]
    public void all_cache_dict_value_should_have_corresponding_dbSet()
    {
        // Vérifie que les noms dans _tableMap pointent vers de vrais DbSets
        var dbSetNames = GetDbSetNames();
        var dbCacheDictValue = DatabaseCacheService.AvailableTables
            .Values.Select(val => val.Replace(DatabaseCacheService.CachePrefix, ""));

        foreach (var dbSetName in dbCacheDictValue)
        {
            Assert.Contains(
                dbSetName,
                dbSetNames,
                StringComparer.OrdinalIgnoreCase
            );
        }
    }
    
    [Fact]
    public void all_dbSet_should_have_corresponding_enum_value()
    {
        // Arrange
        var dbSetNames = GetDbSetNames();
        var enumNames = Enum.GetValues<CachedTables>()
            .Select(t => t.ToString())
            .ToList();

        // Act & Assert
        foreach (var dbSetName in dbSetNames)
        {
            Assert.Contains(
                dbSetName,
                enumNames,
                StringComparer.OrdinalIgnoreCase
            );
        }
    }

    [Fact]
    public void all_dbSet_should_have_corresponding_cache_dictionary_value()
    {
        // Arrange
        var dbSetNames = GetDbSetNames();
        var mappedDbSetNames = DatabaseCacheService.AvailableTables
            .Values.Select(val => val.Replace(DatabaseCacheService.CachePrefix, ""));

        // Act & Assert
        foreach (var dbSetName in dbSetNames)
        {
            Assert.Contains(
                dbSetName,
                mappedDbSetNames,
                StringComparer.OrdinalIgnoreCase
            );
        }
    }
}