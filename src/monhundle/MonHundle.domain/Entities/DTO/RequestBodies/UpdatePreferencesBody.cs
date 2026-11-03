using System.ComponentModel.DataAnnotations;

namespace MonHundle.domain.Entities.DTO;

public record UpdatePreferencesBody(
    bool? tableVisualAid,
    string[]? gameList,
    [RegularExpression("^[a-z0-9-]{1,32}$")]
    string? theme,
    [RegularExpression("^[a-z]{2,3}(-[A-Z]{2})?$")]
    string? preferredLanguage
);