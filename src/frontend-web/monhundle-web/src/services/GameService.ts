import GameStatus from "@/domain/GameStatus";
import type Guess from "@/domain/Guess";
import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";
import { type GameStore } from "@/stores/GameStore";
import { CookieKeys, setCookie } from "@/services/CookieService";
import { msUntilMidnightUTC } from '@/domain/Utils';
import { GameModes } from "@/domain/enums/GameModes";
import { DailyGameAlreadyExistsError } from "@/domain/errors/DailyGameAlreadyExistsError";

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
        }).catch( async (err) => {
            if (!(err instanceof DailyGameAlreadyExistsError)) {
                throw err;
            }

            const gameSet = await this.resumeGame(err.getExistingGameId);
            
            if (!gameSet) {
                throw new Error("game could not be set");
            }

            return err.getExistingGameId;
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