namespace MonHundle.IntegrationTests.Fixtures;

// Ties test classes to a single shared PostgresDatabaseFixture instance (and therefore a
// single container) for the whole collection - starting a container per test would be too slow.
[CollectionDefinition(Name)]
public class DatabaseCollection : ICollectionFixture<PostgresDatabaseFixture>
{
    public const string Name = "Database collection";
}
