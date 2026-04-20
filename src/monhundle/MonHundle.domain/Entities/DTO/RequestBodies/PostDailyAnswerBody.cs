using System.ComponentModel.DataAnnotations;

namespace MonHundle.domain.Entities.DTO;

public record PostDailyAnswerBody([Required] DateTime date, [Required] int monsterId)
{ }