using MonHundle.domain.Entities.DTO;

namespace MonHundle.domain.Entities;

public class Game
{
    public Guid Id { get; set;}
    public Guid playerId { get; set; }
    public GuessableMonster Answer {get; set;}
    public bool Finished { get; set; } = false;
    public GuessResponse[] Guesses { get; set; }
}