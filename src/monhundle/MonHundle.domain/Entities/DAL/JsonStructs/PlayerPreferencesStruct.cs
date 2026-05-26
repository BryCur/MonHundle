using MonHundle.domain.Entities.DTO;

namespace MonHundle.domain.Entities.DAL.JsonStructs;

public struct PlayerPreferencesStruct
{
    public bool enableTableAccessibility { get; set; }
    public string[] gameList { get; set; }

    public static PlayerPreferencesStruct FromBody(UserPreferencesBody source)
    {
        return new PlayerPreferencesStruct()
        {
            enableTableAccessibility = source.enableTableVisualAid ?? false,
            gameList = source.gameTitles ?? new string[0],
        };
    }
    
}