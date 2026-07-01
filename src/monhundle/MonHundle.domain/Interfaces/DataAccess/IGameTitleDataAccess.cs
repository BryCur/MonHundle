namespace MonHundle.domain.Interfaces.DataAccess;

public interface IGameTitleDataAccess
{
    Task<List<String>> GetGameTitles();
}