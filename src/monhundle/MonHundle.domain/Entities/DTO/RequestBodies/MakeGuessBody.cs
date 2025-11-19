using System.ComponentModel.DataAnnotations;

namespace MonHundle.domain.Entities.DTO;

public record MakeGuessBody([Required] Guid gameId,  [Required] string guessId);