import { describe, expect, it } from 'vitest';
import { GameNotSetError } from '@/domain/errors/GameNotSetError';

describe('GameNotSetError', () => {
    it('is recognisable by instanceof (both the subclass and Error)', () => {
        const error = new GameNotSetError('no game set');

        expect(error).toBeInstanceOf(GameNotSetError);
        expect(error).toBeInstanceOf(Error);
    });

    it('keeps the given message', () => {
        const error = new GameNotSetError('no game set');

        expect(error.message).toBe('no game set');
    });
});
