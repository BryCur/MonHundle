namespace MonHundle.domain.Entities.DTO;

public record CacheKeysErrorResponse(string Message, IEnumerable<string>? Keys = null);
