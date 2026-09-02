import { ComparisonResults } from "@/domain/enums/ComparisonResults";
import { GameStates } from "@/domain/enums/GameStates";
import GameStatus from "@/domain/GameStatus";
import type Guess from "@/domain/Guess";
import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";
import { type GameStore } from "@/stores/GameStore";
import { CookieKeys, setCookie } from "@/services/CookieService";
import { msUntilMidnightUTC } from '@/domain/Utils';
import GameStateResponse from "@/domain/responses/GameStateResponse";
import { GameModes } from "@/domain/enums/GameModes";

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

            let newGame = new GameStatus(gameId, GameModes.Unlimited);
            this.gameStore.setGame(newGame);

            setCookie(CookieKeys.CURRENT_UNLIMITED_GAME, gameId);
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
                setCookie(CookieKeys.CURRENT_UNLIMITED_GAME, gameId);
                return this.gameStore.isGameOngoing()
            }

            return false
        })
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

            let newGame = new GameStatus(gameId, GameModes.Daily);
            this.gameStore.setGame(newGame);

            let now = Date.now()

            setCookie(CookieKeys.CURRENT_DAILY_GAME, gameId, msUntilMidnightUTC());
            return gameId;
        }).catch( async err => {
            let gameSet = await this.resumeGame(err.message)
            if(gameSet) {
                return err
            } else {
                throw new Error("game could not be set")
            }
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
                setCookie(CookieKeys.CURRENT_DAILY_GAME, gameId, msUntilMidnightUTC());
                return true;
            }

            return false;
        })
    }
}