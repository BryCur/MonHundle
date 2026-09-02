import type { GameModes } from "../enums/GameModes";
import type { GameStates } from "../enums/GameStates";
import type Guess from "../Guess";

export default class GameStateResponse {
    public readonly gameId: string;
    public readonly guesses: Guess[];
    public readonly state: GameStates;
    public readonly gameMode: GameModes;

    public constructor(gameId: string, guesses: Guess[], state: GameStates, gameMode:GameModes) {
        this.gameId = gameId;
        this.guesses = guesses;
        this.state = state
        this.gameMode = gameMode;
    }
}