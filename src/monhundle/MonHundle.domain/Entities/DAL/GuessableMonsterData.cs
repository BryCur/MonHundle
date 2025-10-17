using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MonHundle.domain.Entities.DAL;

[Keyless]
[Table("guessable_monsters_v", Schema = "public")]
public record GuessableMonsterData(
    [property: Column("monster_id")] int MonsterId,
    [property: Column("monster_code")] String MonsterCode,
    [property: Column("generation")] int Generation,
    [property: Column("threat_level")] int ThreatLevel,
    [property: Column("classification_list")] String ClassificationList,
    [property: Column("weakness_list")] String? WeaknessList,
    [property: Column("affliction_list")] String? AfflictionList,
    [property: Column("habitat_list")] String HabitatList,
    [property: Column("games_list")] String GamesList
);