using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MonHundle.domain.Entities.DAL.JsonStructs;

namespace MonHundle.domain.Entities.DAL;

[Table("players", Schema = "public")]
public class Player
{
    [Key]
    [Column("id")] 
    public int? Id { get; set; }
    
    [Column("player_uid")] 
    public Guid PlayerUid { get; set; }
    
    // confirguration for this col made in AppDbContext.cs
    public PlayerPreferencesStruct? JsonPreferences { get; set; }
    
    [Column("last_connection")]
    public DateTime? last_connection { get; set; }
}