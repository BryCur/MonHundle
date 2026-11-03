using System.ComponentModel.DataAnnotations;

namespace MonHundle.domain.Entities.DTO;

public record UpdatePreferencesBody(
    bool? tableVisualAid,
    string[]? gameList,
    [RegularExpression("^[a-z0-9-]{1,32}$")]
    [MinLength(1)]
    string? theme,
    [RegularExpression("^[a-z]{2,3}(-[A-Z]{2})?$")]
    [MinLength(1)]
    string? preferredLanguage
);