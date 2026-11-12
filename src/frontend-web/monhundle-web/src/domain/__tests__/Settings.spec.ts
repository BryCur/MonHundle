import { describe, expect, it } from 'vitest';
import { createDefaultSettings, isSupportedLocale } from '@/domain/Settings';
import { isThemeId } from '@/domain/Theme';

describe('isSupportedLocale', () => {
    it.each(['en', 'fr'])('accepts a supported locale (%s)', (value) => {
        expect(isSupportedLocale(value)).toBe(true);
    });

    it.each(['', 'de', 'EN', 'fr-FR', null, undefined, 1])(
        'rejects an unsupported value (%s)',
        (value) => {
            expect(isSupportedLocale(value)).toBe(false);
        },
    );
});

describe('isThemeId', () => {
    it('accepts a registered theme', () => {
        expect(isThemeId('classic')).toBe(true);
    });

    it.each(['', 'dark', 'Classic', null, undefined, 1])(
        'rejects an unknown value (%s)',
        (value) => {
            expect(isThemeId(value)).toBe(false);
        },
    );
});

describe('createDefaultSettings', () => {
    it('returns settings without any explicit choice', () => {
        expect(createDefaultSettings()).toEqual({
            language: null,
            theme: null,
            gameList: null,
            tableVisualAid: false,
        });
    });

    it('returns a new object on every call', () => {
        const first = createDefaultSettings();
        first.language = 'fr';

        expect(createDefaultSettings().language).toBeNull();
    });
});
