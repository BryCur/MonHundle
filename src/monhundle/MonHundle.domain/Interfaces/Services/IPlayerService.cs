using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;

namespace MonHundle.domain.Interfaces.Services;

public interface IPlayerService
{
    Guid AuthPlayer(string? playerUid);
    bool CheckPlayerExists(Guid playerUid);
    PlayerProfileResponse GetPlayerProfile(Guid playerUid);
    void SaveUserPreferences(Guid playerUid, PlayerPreferencesStruct updatedPreferences);
}