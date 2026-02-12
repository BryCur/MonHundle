using System.Runtime.InteropServices.JavaScript;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;

namespace MonHundle.domain.Entities;

public class Game
{
    public Guid Id { get; set;}
    public Guid PlayerId { get; set; }
    public GameModes GameMode { get; set; }
    public required GuessableMonster Answer {get; set;}
    public GameStates State { get; set; } = GameStates.Ongoing;
    public List<MonsterGuessDTO> Guesses { get; set; } = [];
    public DateTime StartTime { get; set; }
}