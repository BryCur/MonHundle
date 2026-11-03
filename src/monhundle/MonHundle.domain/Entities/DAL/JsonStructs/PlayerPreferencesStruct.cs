using System.Text.Json.Serialization;
using MonHundle.domain.Entities.DTO;

namespace MonHundle.domain.Entities.DAL.JsonStructs;

public struct PlayerPreferencesStruct
{
    // version of the json shape stored in players.preferences; rows written before versioning read as 0
    public const int CurrentVersion = 1;

    public int version { get; set; }

    // json key kept from the original shape so existing rows still map to this property
    [JsonPropertyName("enableTableAccessibility")]
    public bool tableVisualAid { get; set; }
    public string[] gameList { get; set; }
    public string? theme { get; set; }
    public string? preferredLanguage { get; set; }

    public static PlayerPreferencesStruct FromBody(UserPreferencesBody source)
    {
        return new PlayerPreferencesStruct()
        {
            tableVisualAid = source.enableTableVisualAid ?? false,
            gameList = source.gameTitles ?? new string[0],
        };
    }
    
}