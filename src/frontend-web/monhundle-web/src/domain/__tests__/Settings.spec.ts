import { describe, expect, it } from 'vitest';
import {
    createDefaultSettings,
    isSupportedLocale,
    LOCALE_NATIVE_NAMES,
    resolveLocale,
    SUPPORTED_LOCALES,
} from '@/domain/Settings';
import { DEFAULT_THEME, isThemeId, resolveTheme, THEME_IDS } from '@/domain/Theme';

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
        expect(isThemeId('classic-dark')).toBe(true);
    });

    it.each(['', 'dark', 'classic', 'Classic-Dark', null, undefined, 1])(
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

describe('resolveLocale', () => {
    it('keeps an explicit choice over the browser languages', () => {
        expect(resolveLocale('en', ['fr-FR', 'fr'])).toBe('en');
    });

    it.each([
        ['an exact match', ['fr'], 'fr'],
        ['a regional variant', ['fr-CH'], 'fr'],
        ['a script and region variant', ['fr-Latn-CA'], 'fr'],
        ['an uppercase tag', ['FR-ch'], 'fr'],
    ])('recognises %s of a supported language', (_label, browserLanguages, expected) => {
        expect(resolveLocale(null, browserLanguages)).toBe(expected);
    });

    it('follows the order of preference of the browser', () => {
        expect(resolveLocale(null, ['fr-CH', 'en-US'])).toBe('fr');
        expect(resolveLocale(null, ['en-US', 'fr-CH'])).toBe('en');
    });

    it('skips the unsupported languages instead of falling back right away', () => {
        expect(resolveLocale(null, ['de-CH', 'it', 'fr-CH', 'en'])).toBe('fr');
    });

    it.each([
        ['no supported language', ['de-CH', 'it']],
        ['no browser language', []],
        ['an empty tag', ['']],
    ])('falls back to english with %s', (_label, browserLanguages) => {
        expect(resolveLocale(null, browserLanguages)).toBe('en');
    });
});

describe('LOCALE_NATIVE_NAMES', () => {
    it('names every supported locale', () => {
        for (const locale of SUPPORTED_LOCALES) {
            expect(LOCALE_NATIVE_NAMES[locale]).toBeTruthy();
        }
    });
});

describe('resolveTheme', () => {
    it('keeps an explicit choice', () => {
        expect(resolveTheme('classic-dark')).toBe('classic-dark');
    });

    it('falls back to the default theme without an explicit choice', () => {
        expect(resolveTheme(null)).toBe(DEFAULT_THEME);
    });

    it('has a registered default theme', () => {
        expect(THEME_IDS).toContain(DEFAULT_THEME);
    });
});
