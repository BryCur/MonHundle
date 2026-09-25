import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    LocalStorageKeys,
    getStoredUserId,
    setStoredUserId,
    clearStoredUserId,
} from '@/services/LocalStorageService';

describe('LocalStorageService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('round-trips the user id through set / get / clear', () => {
        setStoredUserId('user-1');
        expect(getStoredUserId()).toBe('user-1');
        expect(localStorage.getItem(LocalStorageKeys.USER_ID)).toBe('user-1');

        clearStoredUserId();
        expect(getStoredUserId()).toBeNull();
    });

    it('returns null instead of throwing when localStorage reads fail', () => {
        vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
            throw new Error('storage disabled');
        });

        expect(() => getStoredUserId()).not.toThrow();
        expect(getStoredUserId()).toBeNull();
    });

    it('swallows errors when localStorage writes fail', () => {
        vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
            throw new Error('quota exceeded');
        });
        vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
            throw new Error('storage disabled');
        });

        expect(() => setStoredUserId('user-1')).not.toThrow();
        expect(() => clearStoredUserId()).not.toThrow();
    });
});
