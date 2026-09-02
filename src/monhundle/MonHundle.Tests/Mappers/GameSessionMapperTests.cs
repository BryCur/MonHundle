using MonHundle.domain.Entities;
using MonHundle.domain.Entities.Criterias;
using MonHundle.domain.Entities.DAL;
using MonHundle.domain.Entities.DAL.Mappers;
using MonHundle.domain.Entities.DTO;
using MonHundle.domain.Enums;

namespace MonHundle.Tests.Mappers;

public class GameSessionMapperTests
{
    private readonly Player _player = new()
    {
        Id = 1,
        PlayerUid = Guid.NewGuid()
    };

    /// <summary>
    /// Regression: <see cref="GameSessionMapper.ToDto"/> used to drop <c>GameMode</c>, so every
    /// resumed game came back as <see cref="GameModes.Unlimited"/> (enum default) regardless of
    /// what was persisted, which made a resumed daily game leak onto the unlimited page.
    /// </summary>
    [Theory]
    [InlineData(GameModes.Daily)]
    [InlineData(GameModes.Unlimited)]
    public void ToDto_should_map_the_persisted_GameMode(GameModes persistedMode)
    {
        GameSession session = BuildSession(persistedMode);

        Game game = GameSessionMapper.ToDto(session, _player, BuildMonster());

        Assert.Equal(persistedMode, game.GameMode);
    }

    [Theory]
    [InlineData(GameModes.Daily)]
    [InlineData(GameModes.Unlimited)]
    public void ToEntity_should_map_the_GameMode(GameModes mode)
    {
        Game game = BuildGame(mode);

        GameSession session = GameSessionMapper.ToEntity(game, playerId: _player.Id!.Value);

        Assert.Equal(mode, session.GameMode);
    }

    [Theory]
    [InlineData(GameModes.Daily)]
    [InlineData(GameModes.Unlimited)]
    public void ToEntity_then_ToDto_should_preserve_the_GameMode(GameModes mode)
    {
        Game original = BuildGame(mode);

        GameSession session = GameSessionMapper.ToEntity(original, playerId: _player.Id!.Value);
        Game roundTripped = GameSessionMapper.ToDto(session, _player, original.Answer);

        Assert.Equal(mode, roundTripped.GameMode);
    }

    [Fact]
    public void ToEntity_then_ToDto_should_preserve_the_rest_of_the_game_state()
    {
        GuessableMonster answer = BuildMonster();
        Game original = BuildGame(GameModes.Daily, answer);
        original.State = GameStates.Win;
        original.Guesses.Add(BuildGuess(answer));

        GameSession session = GameSessionMapper.ToEntity(original, playerId: _player.Id!.Value);
        Game roundTripped = GameSessionMapper.ToDto(session, _player, answer);

        Assert.Equal(original.Id, roundTripped.Id);
        Assert.Equal(_player.PlayerUid, roundTripped.PlayerId);
        Assert.Equal(GameStates.Win, roundTripped.State);
        Assert.Same(answer, roundTripped.Answer);
        Assert.Single(roundTripped.Guesses);
        Assert.Equal(original.Guesses[0].MonsterCode, roundTripped.Guesses[0].MonsterCode);
    }

    private static GameSession BuildSession(GameModes mode) => new()
    {
        Id = 1,
        GameUid = Guid.NewGuid(),
        PlayerId = 1,
        AnswerMonsterId = 1,
        GameMode = mode,
        State = nameof(GameStates.Ongoing),
        GameGuesses = [],
    };

    private Game BuildGame(GameModes mode, GuessableMonster? answer = null) => new()
    {
        Id = Guid.NewGuid(),
        PlayerId = _player.PlayerUid,
        GameMode = mode,
        Answer = answer ?? BuildMonster(),
        State = GameStates.Ongoing,
        StartTime = DateTime.UtcNow,
    };

    private static GuessableMonster BuildMonster() => new(
        1,
        "test_monster",
        new MonsterCriteria(
            new CriteriaNumber(1),
            new CriteriaNumber(1),
            new CriteriaObject<Classifications>(Classifications.Amphibian),
            new CriteriaSet<Weaknesses>(new HashSet<Weaknesses>()),
            new CriteriaSet<Diets>(new HashSet<Diets>()),
            new CriteriaSet<Afflictions>(new HashSet<Afflictions>()),
            new CriteriaSet<Habitats>(new HashSet<Habitats>())
        ));

    private static MonsterGuessDTO BuildGuess(GuessableMonster monster) => new(
        monster.GetCode(),
        MonsterCriteriaDTO.ToDto(monster.GetCriterias()),
        monster.compareTo(monster));
}
