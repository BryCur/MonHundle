import type IGameApi from '@/domain/interfaces/api-contracts/IGameApi';

import { apiFetch, ensureOk } from './ApiBaseAccess';
import type { GameStateResponse, GuessResponse, MakeGuessBody } from '@/domain/ApiModels';
import GameStatus from '@/domain/GameStatus';

export class UnlimitedGameApi implements IGameApi {
    constructor() {}

    public async newGame(): Promise<string> {
        const response = await apiFetch('/game/unlimited/start', { method: 'POST' });

        ensureOk(response, 'Unexpected error while creating new unlimited game');

        return (await response.json()) as string;
    }

    public async makeGuess(gameId: string, monsterCode: string): Promise<GuessResponse> {
        const guessRequestBody: MakeGuessBody = { gameId: gameId, guessId: monsterCode };
        const guessResponse = await apiFetch('/game/unlimited/guess', {
            method: 'POST',
            body: JSON.stringify(guessRequestBody),
        });

        ensureOk(guessResponse, 'Unexpected error while submitting guess to unlimited game');

        return (await guessResponse.json()) as GuessResponse;
    }

    public async resumeGame(gameId: string): Promise<GameStatus | null> {
        const response: Response = await apiFetch(`/game/unlimited/resume/${gameId}`, {
            method: 'GET',
        });

        if (response.status === 404) {
            return null;
        }

        ensureOk(response, 'Unexpected error while fetching unlimited game');

        return GameStatus.fromResponse((await response.json()) as GameStateResponse);
    }
}
