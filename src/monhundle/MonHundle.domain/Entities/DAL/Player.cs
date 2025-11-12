using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonHundle.domain.Entities.DAL;

[Table("players", Schema = "public")]
public class Player
{
    [Key]
    [Column("id")] 
    public int? Id { get; set; }
    [Column("player_uid")] 
    public Guid PlayerUid { get; set; }
    [Column("preferences", TypeName = "json")] 
    public string? JsonPreferences { get; set; }
    [Column("last_connection")]
    public DateTime? last_connection { get; set; }
}