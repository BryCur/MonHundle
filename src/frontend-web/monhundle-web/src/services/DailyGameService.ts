import GameStatus from '@/domain/GameStatus';
import type Guess from '@/domain/Guess';
import type IGameApi from '@/domain/interfaces/api-contracts/IGameApi';
import { type GameStore } from '@/stores/GameStore';
import { CookieKeys, setCookie } from '@/services/CookieService';
import { msUntilMidnightUTC } from '@/domain/Utils';
import { GameModes } from '@/domain/enums/GameModes';
import { DailyGameAlreadyExistsError } from '@/domain/errors/DailyGameAlreadyExistsError';

export class DailyGameService {
    private readonly gameApi: IGameApi;
    private readonly gameStore: GameStore;

    constructor(gameApi: IGameApi, gameStore: GameStore) {
        this.gameApi = gameApi;
        this.gameStore = gameStore;
    }

    public async startNewGame(): Promise<string> {
        try {
            const gameId: string = await this.gameApi.newGame();

            const newGame = new GameStatus(gameId, GameModes.Daily);
            this.gameStore.setGame(newGame);

            setCookie(CookieKeys.CURRENT_DAILY_GAME, gameId, msUntilMidnightUTC());
            return gameId;
        } catch (err) {
            // The player already started today's game: resume it instead of failing.
            if (!(err instanceof DailyGameAlreadyExistsError)) {
                throw err;
            }

            const gameSet = await this.resumeGame(err.getExistingGameId);

            if (!gameSet) {
                throw new Error('game could not be set');
            }

            return err.getExistingGameId;
        }
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
            setCookie(CookieKeys.CURRENT_DAILY_GAME, gameId, msUntilMidnightUTC());
            return true;
        }

        return false;
    }
}
