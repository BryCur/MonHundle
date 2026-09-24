import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/ApiService/ApiBaseAccess', () => ({
    apiFetch: vi.fn(),
}));

import { DailyGameApi } from '@/services/ApiService/DailyGameApi';
import { apiFetch } from '@/services/ApiService/ApiBaseAccess';
import { DailyGameAlreadyExistsError } from '@/domain/errors/DailyGameAlreadyExistsError';

const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

async function rejection<E = unknown>(promise: Promise<unknown>): Promise<E> {
    return promise.then(
        () => {
            throw new Error('expected the promise to reject');
        },
        (err) => err,
    );
}

describe('DailyGameApi', () => {
    beforeEach(() => vi.clearAllMocks());

    it('newGame() throws DailyGameAlreadyExistsError carrying the existing id on a 409', async () => {
        apiFetchMock.mockResolvedValue({ ok: false, status: 409, json: async () => 'existing-9' });

        const error = await rejection<DailyGameAlreadyExistsError>(new DailyGameApi().newGame());

        expect(error).toBeInstanceOf(DailyGameAlreadyExistsError);
        expect(error.getExistingGameId).toBe('existing-9');
    });
});
