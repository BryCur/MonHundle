using System.ComponentModel.DataAnnotations;

namespace MonHundle.domain.Entities.DTO;

public record UserPreferencesBody(
    [Required] bool? enableTableVisualAid,
    [Required] string[] gameTitles
);