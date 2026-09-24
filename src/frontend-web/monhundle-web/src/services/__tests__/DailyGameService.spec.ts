import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyGameService } from '@/services/DailyGameService';
import type IGameApi from '@/domain/interfaces/api-contracts/IGameApi';
import type { GameStore } from '@/stores/GameStore';
import type GameStatus from '@/domain/GameStatus';
import { DailyGameAlreadyExistsError } from '@/domain/errors/DailyGameAlreadyExistsError';

const mockedGameApi = {
    newGame: vi.fn(),
    makeGuess: vi.fn(),
    saveGame: vi.fn(),
    resumeGame: vi.fn(),
};

const mockedGameStore = {
    game: null as GameStatus | null,
    setGame: vi.fn(),
};

function buildService() {
    return new DailyGameService(mockedGameApi as IGameApi, mockedGameStore as unknown as GameStore);
}

describe('DailyGameService — conflict recovery on startNewGame()', () => {
    beforeEach(() => vi.clearAllMocks());

    it('recovers by resuming the existing game when the day already has one', async () => {
        mockedGameApi.newGame.mockRejectedValueOnce(
            new DailyGameAlreadyExistsError('already exists', 'existing-game'),
        );
        mockedGameApi.resumeGame.mockResolvedValueOnce({ gameId: 'existing-game' } as GameStatus);

        const id = await buildService().startNewGame();

        expect(id).toBe('existing-game');
        expect(mockedGameApi.resumeGame).toHaveBeenCalledWith('existing-game');
        expect(mockedGameStore.setGame).toHaveBeenCalledWith({ gameId: 'existing-game' });
    });

    it('throws when the recovery resume finds no game', async () => {
        mockedGameApi.newGame.mockRejectedValueOnce(
            new DailyGameAlreadyExistsError('already exists', 'existing-game'),
        );
        mockedGameApi.resumeGame.mockResolvedValueOnce(null);

        await expect(buildService().startNewGame()).rejects.toThrow('game could not be set');
    });

    it('re-throws any error that is not a DailyGameAlreadyExistsError', async () => {
        mockedGameApi.newGame.mockRejectedValueOnce(new Error('network'));

        await expect(buildService().startNewGame()).rejects.toThrow('network');
        expect(mockedGameApi.resumeGame).not.toHaveBeenCalled();
    });
});
