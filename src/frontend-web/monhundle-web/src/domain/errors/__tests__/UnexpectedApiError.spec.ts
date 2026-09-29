import { describe, expect, it } from 'vitest';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';

describe('UnexpectedApiError', () => {
    it('is recognisable by instanceof (both the subclass and Error)', () => {
        const error = new UnexpectedApiError('could not get resource');

        expect(error).toBeInstanceOf(UnexpectedApiError);
        expect(error).toBeInstanceOf(Error);
    });

    it('keeps the given message', () => {
        const error = new UnexpectedApiError('could not get resource');

        expect(error.message).toBe('could not get resource');
    });
});
