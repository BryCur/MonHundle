namespace MonHundle.IntegrationTests.Fixtures;

// base class for testing classes where reference data are modified/inserted
public abstract class DataAccessTestBase(PostgresDatabaseFixture fixture) : IAsyncLifetime
{
    protected PostgresDatabaseFixture Fixture { get; } = fixture;
    
    // acts as a beforeEach() 
    public virtual Task InitializeAsync() => Fixture.ResetTransactionalDataAsync();
    // acts as a afterEach()
    public virtual Task DisposeAsync() => Task.CompletedTask;
}
