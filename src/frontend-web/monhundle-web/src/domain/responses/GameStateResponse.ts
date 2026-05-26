import type { GameStates } from "../enums/GameStates";
import type Guess from "../Guess";

export default class GameStateResponse {
    public readonly gameId: string;
    public readonly guesses: Guess[];
    public readonly state: GameStates;

    public constructor(gameId: string, guesses: Guess[], state: GameStates) {
        this.gameId = gameId;
        this.guesses = guesses;
        this.state = state
    }
}