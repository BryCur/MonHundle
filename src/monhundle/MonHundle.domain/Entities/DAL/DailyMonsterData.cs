using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MonHundle.domain.Entities.DAL;

[Table("history_daily_mode", Schema = "public")]
public class DailyMonsterData
{
    [Key]
    [Column("id")] public int Id { get; set; }
    [Column("date")] public DateTime Date { get; set; }
    [Column("answer_monster_id")] public int MonsterId { get; set; }
    public GuessableMonsterData monsterData { get; set; }
}