import { describe, expect, it } from 'vitest';
import { BaseNotifiedError } from '@/domain/errors/NotifiedError/BaseNotifiedError';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';

describe('LoadFailedError', () => {
    it('is a notified error', () => {
        const error = new LoadFailedError('could not load', 'AllGameTitle');

        expect(error).toBeInstanceOf(LoadFailedError);
        expect(error).toBeInstanceOf(BaseNotifiedError);
    });

    it('exposes the resource that could not be loaded', () => {
        const error = new LoadFailedError('could not load', 'AllGameTitle');

        expect(error.resource).toBe('AllGameTitle');
    });

    it('keeps the api error it wraps as its cause', () => {
        const apiError = new UnexpectedApiError('could not get game titles', 500);

        const error = new LoadFailedError('could not load', 'AllGameTitle', { cause: apiError });

        expect(error.cause).toBe(apiError);
    });

    it('is named LoadFailedError', () => {
        const error = new LoadFailedError('could not load', 'AllGameTitle');

        expect(error.name).toBe('LoadFailedError');
    });
});
