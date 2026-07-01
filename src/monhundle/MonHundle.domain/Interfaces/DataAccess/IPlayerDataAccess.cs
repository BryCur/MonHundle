using MonHundle.domain.Entities.DAL;

namespace MonHundle.domain.Interfaces.DataAccess;

public interface IPlayerDataAccess
{
    Task UpdatePlayer(Player toSave);
    Task InsertPlayer(Player toSave);
    Task<Player?> GetPlayer(Guid playerId);
}