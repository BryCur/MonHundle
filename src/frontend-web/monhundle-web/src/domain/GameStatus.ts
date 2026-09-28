import {
    ComparisonOutcomes,
    type GameModes,
    type GameStateResponse,
    GameStates,
    type Guess,
} from '@/domain/ApiModels';

export default class GameStatus {
    public readonly gameId: string;
    public readonly guesses: Guess[] = [];
    public state: GameStates;
    public gameMode: GameModes;

    constructor(
        id: string,
        gameMode: GameModes,
        guesses: Guess[] = [],
        state: GameStates = GameStates.Ongoing,
    ) {
        this.gameId = id;
        this.guesses = guesses;
        this.state = state;
        this.gameMode = gameMode;
    }

    /** Builds the game from the backend's game state payload. */
    public static fromResponse(response: GameStateResponse): GameStatus {
        return new GameStatus(response.gameId, response.gameMode, response.guesses, response.state);
    }

    public addGuess(guess: Guess) {
        this.guesses.push(guess);
    }

    public convertGameToShareableString(): string {
        let guessesString: string = '';

        for (const guess of this.guesses) {
            guessesString += this.getStringForResult(guess.comparisonResult.classification);
            guessesString += this.getStringForResult(guess.comparisonResult.generation);
            guessesString += this.getStringForResult(guess.comparisonResult.weaknesses);
            guessesString += this.getStringForResult(guess.comparisonResult.afflictions);
            guessesString += this.getStringForResult(guess.comparisonResult.threatLevel);
            guessesString += this.getStringForResult(guess.comparisonResult.habitats);
            guessesString += '\n';
        }

        return guessesString;
    }

    private getStringForResult(result: ComparisonOutcomes): string {
        switch (result) {
            case ComparisonOutcomes.Correct:
                return '🟩';
            case ComparisonOutcomes.Incorrect:
                return '🟥';
            case ComparisonOutcomes.Higher:
                return '🔺';
            case ComparisonOutcomes.Lower:
                return '🔻';
            case ComparisonOutcomes.Partial:
                return '🟨';
        }
    }
}
