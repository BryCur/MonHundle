using MonHundle.domain.Entities.DAL;

namespace MonHundle.domain.Interfaces.DataAccess;

public interface IPlayerDataAccess
{
    void UpdatePlayer(Player toSave);
    void InsertPlayer(Player toSave);
    Player? GetPlayer(Guid playerId);
}