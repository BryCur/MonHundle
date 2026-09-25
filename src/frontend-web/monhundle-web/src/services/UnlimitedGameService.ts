import GameStatus from '@/domain/GameStatus';
import type Guess from '@/domain/Guess';
import type IGameApi from '@/domain/interfaces/api-contracts/IGameApi';
import { type GameStore } from '@/stores/GameStore';
import { CookieKeys, setCookie } from '@/services/CookieService';
import { GameModes } from '@/domain/enums/GameModes';

export class UnlimitedGameService {
    private readonly gameApi: IGameApi;
    private readonly gameStore: GameStore;

    constructor(gameApi: IGameApi, gameStore: GameStore) {
        this.gameApi = gameApi;
        this.gameStore = gameStore;
    }

    public async startNewGame(): Promise<string> {
        const gameId: string = await this.gameApi.newGame(); // TOFIX could be missing: ok verification before reading the response

        const newGame = new GameStatus(gameId, GameModes.Unlimited);
        this.gameStore.setGame(newGame);

        setCookie(CookieKeys.CURRENT_UNLIMITED_GAME, gameId);
        return gameId;
    }

    public async makeGuess(gameId: string, guessCode: string): Promise<void> {
        const res = await this.gameApi.makeGuess(gameId, guessCode);
        const guessResult: Guess = res; // TOFIX could be missing: ok verification before reading the response
        this.gameStore.addGuess(guessResult);
        this.gameStore.setState(res.gameStateAfterGuess);
    }

    public async resumeGame(gameId: string): Promise<boolean> {
        const res = await this.gameApi.resumeGame(gameId);
        if (res !== null) {
            this.gameStore.setGame(res);
            setCookie(CookieKeys.CURRENT_UNLIMITED_GAME, gameId);
            return this.gameStore.isGameOngoing();
        }

        return false;
    }
}
