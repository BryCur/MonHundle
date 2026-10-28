import { describe, expect, it } from 'vitest';
import { BaseBlockingError, ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';

// BaseBlockingError is abstract: tests go through a minimal subclass
class TestBlockingError extends BaseBlockingError {}

describe('BaseBlockingError', () => {
    it('is recognisable by instanceof (the subclass, the base and Error)', () => {
        const error = new TestBlockingError('something failed', ErrorReason.Critical);

        expect(error).toBeInstanceOf(TestBlockingError);
        expect(error).toBeInstanceOf(BaseBlockingError);
        expect(error).toBeInstanceOf(Error);
    });

    it('keeps the given message', () => {
        const error = new TestBlockingError('something failed', ErrorReason.Critical);

        expect(error.message).toBe('something failed');
    });

    it('is named after the concrete subclass', () => {
        const error = new TestBlockingError('something failed', ErrorReason.Critical);

        expect(error.name).toBe('TestBlockingError');
    });

    it.each(Object.values(ErrorReason))('keeps the given reason (%s)', (reason) => {
        const error = new TestBlockingError('something failed', reason);

        expect(error.reason).toBe(reason);
    });

    it('keeps the given cause', () => {
        const cause = new Error('original failure');

        const error = new TestBlockingError('something failed', ErrorReason.Critical, { cause });

        expect(error.cause).toBe(cause);
    });

    it('has no cause when none is given', () => {
        const error = new TestBlockingError('something failed', ErrorReason.Critical);

        expect(error.cause).toBeUndefined();
    });
});
