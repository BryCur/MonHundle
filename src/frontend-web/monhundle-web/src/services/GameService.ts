import { ComparisonResults } from "@/domain/enums/ComparisonResults";
import { GameStates } from "@/domain/enums/GameStates";
import GameStatus from "@/domain/GameStatus";
import type Guess from "@/domain/Guess";
import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";
import { useGameStore } from "@/stores/GameStore";
import { setCookie } from "./CookieService";

export class GameService {
    private readonly gameApi: IGameApi;
    private readonly gameStore = useGameStore();

    constructor(gameApi: IGameApi){
        this.gameApi = gameApi;
    }

    public async startNewGame(): Promise<string> {
        return await this.gameApi.newGame().then(res => {
            let gameId: string = res;

            let newGame = new GameStatus(gameId);
            this.gameStore.setGame(newGame);

            setCookie("currentGame", gameId);
            return gameId;
        });
    }

    public async makeGuess(gameId: string, guessCode: string): Promise<void>{
        await this.gameApi.makeGuess(gameId, guessCode).then(res => {
            let guessResult: Guess = res
            this.gameStore.game!.guesses.push(guessResult);
            
            let compResults = Object.values(guessResult.comparisonResult) as ComparisonResults[]

            if(compResults.every(r => r == ComparisonResults.Correct)){
                this.gameStore.setState(res.gameStateAfterGuess)
            }
        });
    }

    public async resumeGame(gameId: string): Promise<boolean> {
        return await this.gameApi.resumeGame(gameId).then( res => {
            if (res !== null) {
                this.gameStore.setGame(res);
                setCookie("currentGame", gameId);
                return this.gameStore.isGameOngoing()
            }

            return false
        })
    }
}