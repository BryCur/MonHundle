using MonHundle.domain.Entities.DAL;

namespace MonHundle.domain.Interfaces.Services;

public interface IPlayerService
{
    Guid AuthPlayer(string? playerUid);
}