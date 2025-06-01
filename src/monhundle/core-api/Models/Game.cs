namespace core_api.Models;

public class Game
{
    public Guid Id { get; set;}
    public Guessable Answer {get; set;}
    public bool Finished { get; set; } = false;
}