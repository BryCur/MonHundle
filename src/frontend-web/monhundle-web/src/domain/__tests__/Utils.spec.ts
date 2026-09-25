import { afterEach, describe, expect, it, vi } from 'vitest';
import { isUUID, msUntilMidnightUTC } from '@/domain/Utils';

describe('isUUID', () => {
    it.each([
        '11111111-1111-1111-1111-111111111111',
        '123e4567-e89b-42d3-a456-426614174000',
        'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA',
    ])('accepts a well-formed uuid (%s)', (value) => {
        expect(isUUID(value)).toBe(true);
    });

    it.each([
        '',
        'not-a-uuid',
        '11111111111111111111111111111111',
        '11111111-1111-1111-1111-11111111111',
        'gggggggg-1111-1111-1111-111111111111',
    ])('rejects a malformed uuid (%s)', (value) => {
        expect(isUUID(value)).toBe(false);
    });
});

describe('msUntilMidnightUTC', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns the exact number of ms left until the next UTC midnight', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-15T23:00:00.000Z'));

        expect(msUntilMidnightUTC()).toBe(60 * 60 * 1000);
    });

    it('returns a full day at UTC midnight', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-15T00:00:00.000Z'));

        expect(msUntilMidnightUTC()).toBe(24 * 60 * 60 * 1000);
    });

    it('is always strictly positive', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-30T23:59:59.999Z'));

        expect(msUntilMidnightUTC()).toBeGreaterThan(0);
    });
});
