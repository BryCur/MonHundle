import type Guess from "./Guess";

export default class GameStatus {
    public readonly id: string;
    public readonly guesses : Guess[] = [];

    constructor(id: string) {
        this.id = id
    }

    addguess(guess: Guess) {
        this.guesses.push(guess);
    }
}