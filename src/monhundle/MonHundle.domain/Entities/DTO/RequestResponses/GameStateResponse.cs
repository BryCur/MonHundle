using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities.DTO;

public record GameStateResponse(
    Guid GameId,
    GameStates State,
    List<MonsterGuessDTO> MonsterGuesses
)
{
}