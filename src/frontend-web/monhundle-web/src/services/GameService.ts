import { ComparisonResults } from "@/domain/enums/ComparisonResults";
import { GameStates } from "@/domain/enums/GameStates";
import GameStatus from "@/domain/GameStatus";
import type Guess from "@/domain/Guess";
import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";
import { type GameStore } from "@/stores/GameStore";
import { setCookie } from "@/services/CookieService";

export class UnlimitedGameService {
    private readonly gameApi: IGameApi;
    private readonly gameStore: GameStore;

    constructor(gameApi: IGameApi, gameStore: GameStore){
        this.gameApi = gameApi;
        this.gameStore = gameStore
    }

    public async startNewGame(): Promise<string> {
        return await this.gameApi.newGame().then(res => {
            let gameId: string = res;

            let newGame = new GameStatus(gameId);
            this.gameStore.setGame(newGame);

            setCookie("currentUnlimitedGame", gameId);
            return gameId;
        });
    }

    public async makeGuess(gameId: string, guessCode: string): Promise<void>{
        await this.gameApi.makeGuess(gameId, guessCode).then(res => {
            let guessResult: Guess = res
            this.gameStore.addGuess(guessResult);
            this.gameStore.setState(res.gameStateAfterGuess)
        });
    }

    public async resumeGame(gameId: string): Promise<boolean> {
        return await this.gameApi.resumeGame(gameId).then( res => {
            if (res !== null) {
                this.gameStore.setGame(res);
                setCookie("currentUnlimitedGame", gameId);
                return this.gameStore.isGameOngoing()
            }

            return false
        })
    }

    public convertGameToShareableString() : string {
        let guessesString: string = "";
        let guesses: Guess[] = this.gameStore.game?.guesses || [];

        for(let guess of guesses) {
            guessesString += this.getStringForResult(guess.comparisonResult.classification);
            guessesString += this.getStringForResult(guess.comparisonResult.generation);
            guessesString += this.getStringForResult(guess.comparisonResult.weaknesses);
            guessesString += this.getStringForResult(guess.comparisonResult.afflictions);
            guessesString += this.getStringForResult(guess.comparisonResult.threatLevel);
            guessesString += this.getStringForResult(guess.comparisonResult.habitats);
            guessesString += "\n";
        }


        console.log(guessesString)
        
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

export class DailyGameService {
    private readonly gameApi: IGameApi;
    private readonly gameStore: GameStore;

    constructor(gameApi: IGameApi, gameStore: GameStore){
        this.gameApi = gameApi;
        this.gameStore = gameStore
    }

    public async startNewGame(): Promise<string> {
        return await this.gameApi.newGame().then(res => {
            let gameId: string = res;

            let newGame = new GameStatus(gameId);
            this.gameStore.setGame(newGame);

            let now = Date.now()

            setCookie("currentDailyGame", gameId, this.msUntilMidnightUTC());
            return gameId;
        });
    }

    public async makeGuess(gameId: string, guessCode: string): Promise<void>{
        await this.gameApi.makeGuess(gameId, guessCode).then(res => {
            let guessResult: Guess = res
            this.gameStore.addGuess(guessResult);
            this.gameStore.setState(res.gameStateAfterGuess)
        });
    }

    public async resumeGame(gameId: string): Promise<boolean> {
        return await this.gameApi.resumeGame(gameId).then( res => {
            if (res !== null) {
                this.gameStore.setGame(res);
                setCookie("currentDailyGame", gameId, this.msUntilMidnightUTC());
                return true;
            }

            return false;
        })
    }

    private msUntilMidnightUTC(): number {
        const now = new Date();
        const midnightUTC = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 1,
            0, 0, 0, 0
        ));
        return midnightUTC.getTime() - now.getTime();
    }
}