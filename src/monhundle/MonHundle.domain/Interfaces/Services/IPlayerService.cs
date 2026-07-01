using MonHundle.domain.Entities.DAL.JsonStructs;
using MonHundle.domain.Entities.DTO;

namespace MonHundle.domain.Interfaces.Services;

public interface IPlayerService
{
    Task<Guid> AuthPlayer(string? playerUid);
    Task<bool> CheckPlayerExists(Guid playerUid);
    Task<PlayerProfileResponse> GetPlayerProfile(Guid playerUid);
    Task SaveUserPreferences(Guid playerUid, PlayerPreferencesStruct updatedPreferences);
}