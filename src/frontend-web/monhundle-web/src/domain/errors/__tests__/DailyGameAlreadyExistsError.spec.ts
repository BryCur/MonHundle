import { describe, expect, it } from 'vitest';
import { DailyGameAlreadyExistsError } from '@/domain/errors/DailyGameAlreadyExistsError';

describe('DailyGameAlreadyExistsError', () => {
    it('exposes the existing game id', () => {
        const error = new DailyGameAlreadyExistsError('could not create', 'game-123');

        expect(error.getExistingGameId).toBe('game-123');
    });

    it('is recognisable by instanceof (both the subclass and Error)', () => {
        const error = new DailyGameAlreadyExistsError('could not create', 'game-123');

        expect(error).toBeInstanceOf(DailyGameAlreadyExistsError);
        expect(error).toBeInstanceOf(Error);
    });

    it('keeps the message and the game id in the error text', () => {
        const error = new DailyGameAlreadyExistsError('could not create', 'game-123');

        expect(error.message).toContain('could not create');
        expect(error.message).toContain('game-123');
    });
});
