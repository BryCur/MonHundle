namespace core_api.Models.RequestObjects;

public record MakeGuessBody(Guid gameId, string guessId);