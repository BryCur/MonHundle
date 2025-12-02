using System.ComponentModel.DataAnnotations.Schema;

namespace MonHundle.domain.Entities.DAL;

[Table("game_titles", Schema = "public")]
public class GameTitle
{
    [Column("id")] 
    public int Id { get; set; }
    
    [Column("code")]
    public required String Code { get; set; }
    
    [Column("name")] 
    public required String Name { get; set; }
    
    [Column("generation")] 
    public int Generation { get; set; }
    
    [Column("release_year")] 
    public int ReleaseYear { get; set; }
}