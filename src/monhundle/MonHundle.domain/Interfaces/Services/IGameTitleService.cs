namespace MonHundle.domain.Interfaces.Services;

public interface IGameTitleService
{
    Task<List<String>> GetAllGameTitles();
}