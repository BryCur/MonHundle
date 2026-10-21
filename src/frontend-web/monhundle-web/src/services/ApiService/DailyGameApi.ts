import type IGameApi from '@/domain/interfaces/api-contracts/IGameApi';

import { apiFetch, ensureOk } from './ApiBaseAccess';
import type { GameStateResponse, GuessResponse, MakeGuessBody } from '@/domain/ApiModels';
import GameStatus from '@/domain/GameStatus';
import { DailyGameAlreadyExistsError } from '@/domain/errors/DailyGameAlreadyExistsError';

export class DailyGameApi implements IGameApi {
    constructor() {}

    public async newGame(): Promise<string> {
        const response = await apiFetch('/game/daily/start', { method: 'POST' });

        if (response.status === 409) {
            throw new DailyGameAlreadyExistsError(
                'Could not create daily game for today',
                (await response.json()) as string,
            );
        }

        ensureOk(response, 'Unexpected error while creating new daily game');

        return (await response.json()) as string;
    }

    public async makeGuess(gameId: string, monsterCode: string): Promise<GuessResponse> {
        const guessRequestBody: MakeGuessBody = { gameId: gameId, guessId: monsterCode };
        const guessResponse = await apiFetch('/game/daily/guess', {
            method: 'POST',
            body: JSON.stringify(guessRequestBody),
        });

        ensureOk(guessResponse, 'Unexpected error while sending guess to daily game');

        return (await guessResponse.json()) as GuessResponse;
    }

    public async resumeGame(gameId: string): Promise<GameStatus | null> {
        const response: Response = await apiFetch(`/game/daily/resume/${gameId}`, {
            method: 'GET',
        });

        if (response.status === 404) {
            return null;
        }

        ensureOk(response, 'Unexpected error while fetching daily game');

        return GameStatus.fromResponse((await response.json()) as GameStateResponse);
    }
}
