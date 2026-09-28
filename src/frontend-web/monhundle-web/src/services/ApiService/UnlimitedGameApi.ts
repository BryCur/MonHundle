import type IGameApi from '@/domain/interfaces/api-contracts/IGameApi';

import { apiFetch } from './ApiBaseAccess';
import type { GameStateResponse, GuessResponse, MakeGuessBody } from '@/domain/ApiModels';
import GameStatus from '@/domain/GameStatus';

export class UnlimitedGameApi implements IGameApi {
    constructor() {}

    public async newGame(): Promise<string> {
        const response = await apiFetch('/game/unlimited/start', { method: 'POST' });
        return (await response.json()) as string;
    }

    public async makeGuess(gameId: string, monsterCode: string): Promise<GuessResponse> {
        const guessRequestBody: MakeGuessBody = { gameId: gameId, guessId: monsterCode };
        const guessResponse = await apiFetch('/game/unlimited/guess', {
            method: 'POST',
            body: JSON.stringify(guessRequestBody),
        });

        return (await guessResponse.json()) as GuessResponse;
    }

    public async resumeGame(gameId: string): Promise<GameStatus | null> {
        const response: Response = await apiFetch(`/game/unlimited/resume/${gameId}`, {
            method: 'GET',
        });
        if (response.ok) {
            return GameStatus.fromResponse((await response.json()) as GameStateResponse);
        }

        return null;
    }
}
