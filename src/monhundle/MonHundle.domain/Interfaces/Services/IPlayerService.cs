namespace MonHundle.domain.Interfaces.Services;

public interface IPlayerService
{
    Guid AuthPlayer(string? playerUid);
}