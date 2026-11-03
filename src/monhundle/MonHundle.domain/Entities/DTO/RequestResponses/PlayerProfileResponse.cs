
namespace MonHundle.domain.Entities.DTO;

public record PlayerProfileResponse
(
    PlayerPreferencesDTO preferences,
    string? currentDailyGameUuid,
    string? currentUnlimitedGameUuid
);