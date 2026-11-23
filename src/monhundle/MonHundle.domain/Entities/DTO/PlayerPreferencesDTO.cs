using MonHundle.domain.Entities.DAL.JsonStructs;

namespace MonHundle.domain.Entities.DTO;

public record PlayerPreferencesDTO(
    bool tableVisualAid,
    string[] gameList,
    string? theme,
    string? preferredLanguage
)
{
    public static PlayerPreferencesDTO FromStruct(PlayerPreferencesStruct? s) 
    {
        if (s is null)
        {
            return new PlayerPreferencesDTO(false, [], null, null);
        }
        
        return new PlayerPreferencesDTO(
            s.Value.tableVisualAid,
            s.Value.gameList ?? [],
            s.Value.theme,
            s.Value.preferredLanguage
        );
    }
}