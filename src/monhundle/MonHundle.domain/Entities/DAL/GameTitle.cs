using System.ComponentModel.DataAnnotations.Schema;

namespace MonHundle.domain.Entities.DAL;

[Table("game_titles", Schema = "public")]
public class GameTitle
{
    public int id { get; set; }
    public required String Code { get; set; }
    public required String Name { get; set; }
    public int Generation { get; set; }
    public int ReleaseYear { get; set; }
}