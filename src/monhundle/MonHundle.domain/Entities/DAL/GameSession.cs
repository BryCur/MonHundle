using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MonHundle.domain.Entities.DAL.JsonStructs;

namespace MonHundle.domain.Entities.DAL;

[Table("game_sessions", Schema = "public")]
public class GameSession
{
    [Key]
    [Column("id")] 
    public int? Id { get; set; }
    
    [Column("game_uid")] 
    public Guid GameUid { get; set; }
    
    [Column("player_id")] 
    public int PlayerId { get; set; }
    
    [Column("answer_monster_id")] 
    public int AnswerMonsterId { get; set; }
    
    [Column("guesses", TypeName = "json")] 
    public List<GameGuessStruct> GameGuesses { get; set; } = new List<GameGuessStruct>();
    
    [Column("state")] 
    public string State { get; set; }
    
    [Column("start_time")] 
    public DateTime StartTime { get; set; } = DateTime.UtcNow;
    
    [Column("last_update")] 
    public DateTime LastUpdate { get; set; } = DateTime.UtcNow;
    
    [Column("end_time")] 
    public DateTime? EndTime { get; set; }
}