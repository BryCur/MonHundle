import type { ComparisonResults } from "./enums/ComparisonResults";
import { GameStates } from "./enums/GameStates";
import type Guess from "./Guess";

export default class GameStatus {
    public readonly gameId: string;
    public readonly guesses : Guess[] = [];
    public state: GameStates;
    
    constructor(id: string, guesses: Guess[] = [], state: GameStates = GameStates.Ongoing) {
        this.gameId = id;
        this.guesses = guesses
        this.state = state;
    }

    public addguess(guess: Guess) {
        this.guesses.push(guess);
    }
}