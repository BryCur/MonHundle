using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MonHundle.domain.Entities.DAL;

[Keyless]
[Table("history_daily_mode", Schema = "public")]
public class DailyMonsterData
{
    [property: Column("id")] public int Id { get; set; }
    [property: Column("date")] public DateTime Date { get; set; }
    [property: Column("answer_monster_id")] public int MonsterId { get; set; }
    public GuessableMonsterData monsterData { get; set; }
}