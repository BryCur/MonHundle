using MonHundle.domain.Entities.DAL.JsonStructs;

namespace MonHundle.domain.Entities.DTO;

public record PlayerProfileResponse
(
    Boolean enableTableVisualAid,
    string? gameList,
    string? currentDailyGameUuid,
    string? currentUnlimitedGameUuid
);