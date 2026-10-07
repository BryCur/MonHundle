import { describe, expect, it } from 'vitest';
import { BaseNotifiedError } from '@/domain/errors/NotifiedError/BaseNotifiedError';

// BaseNotifiedError is abstract: tests go through a minimal subclass
class TestNotifiedError extends BaseNotifiedError {}

describe('BaseNotifiedError', () => {
    it('is recognisable by instanceof (the subclass, the base and Error)', () => {
        const error = new TestNotifiedError('something failed');

        expect(error).toBeInstanceOf(TestNotifiedError);
        expect(error).toBeInstanceOf(BaseNotifiedError);
        expect(error).toBeInstanceOf(Error);
    });

    it('keeps the given message', () => {
        const error = new TestNotifiedError('something failed');

        expect(error.message).toBe('something failed');
    });

    it('is named after the concrete subclass', () => {
        const error = new TestNotifiedError('something failed');

        expect(error.name).toBe('TestNotifiedError');
    });

    it('keeps the given cause', () => {
        const cause = new Error('original failure');

        const error = new TestNotifiedError('something failed', { cause });

        expect(error.cause).toBe(cause);
    });

    it('has no cause when none is given', () => {
        const error = new TestNotifiedError('something failed');

        expect(error.cause).toBeUndefined();
    });
});
