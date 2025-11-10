import type { ComparisonResults } from "./enums/ComparisonResults";
import { GameStates } from "./enums/GameStates";
import type Guess from "./Guess";

export default class GameStatus {
    public readonly id: string;
    public readonly guesses : Guess[] = [];
    public state: GameStates;

    constructor(id: string) {
        this.id = id
        this.state = GameStates.Ongoing;
    }

    public addguess(guess: Guess) {
        this.guesses.push(guess);
    }
}