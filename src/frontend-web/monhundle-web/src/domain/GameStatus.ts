import { ComparisonResults } from "./enums/ComparisonResults";
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

    public convertGameToShareableString() : string {
        let guessesString: string = "";

        for(let guess of this.guesses) {
            guessesString += this.getStringForResult(guess.comparisonResult.classification);
            guessesString += this.getStringForResult(guess.comparisonResult.generation);
            guessesString += this.getStringForResult(guess.comparisonResult.weaknesses);
            guessesString += this.getStringForResult(guess.comparisonResult.afflictions);
            guessesString += this.getStringForResult(guess.comparisonResult.threatLevel);
            guessesString += this.getStringForResult(guess.comparisonResult.habitats);
            guessesString += "\n";
        }
            
        return guessesString;
    }
    
    private getStringForResult(result: ComparisonResults): string {
        switch(result){
            case ComparisonResults.Correct: return "🟩";
            case ComparisonResults.Incorrect: return "🟥";
            case ComparisonResults.Higher: return "🔺";
            case ComparisonResults.Lower: return "🔻";
            case ComparisonResults.Partial: return "🟨";
        }
    }
}