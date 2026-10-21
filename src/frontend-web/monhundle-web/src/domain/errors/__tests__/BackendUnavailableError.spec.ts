import { describe, expect, it } from 'vitest';
import { BackendUnavailableError } from '@/domain/errors/BackendUnavailableError';

describe('BackendUnavailableError', () => {
    it('is recognisable by instanceof (both the subclass and Error)', () => {
        const error = new BackendUnavailableError('service unreachable');

        expect(error).toBeInstanceOf(BackendUnavailableError);
        expect(error).toBeInstanceOf(Error);
    });

    it('keeps the given message', () => {
        const error = new BackendUnavailableError('service unreachable');

        expect(error.message).toBe('service unreachable');
    });

    it('is named after its class', () => {
        const error = new BackendUnavailableError('service unreachable');

        expect(error.name).toBe('BackendUnavailableError');
    });

    it('keeps the given cause', () => {
        const cause = new TypeError('Failed to fetch');

        const error = new BackendUnavailableError('service unreachable', { cause });

        expect(error.cause).toBe(cause);
    });

    it('has no cause when none is given', () => {
        const error = new BackendUnavailableError('service unreachable');

        expect(error.cause).toBeUndefined();
    });
});
