import type { ThemeId } from '@/domain/Theme';

// "as const" adds the values in the type, turns the type from "string[]" into "readonly ['en', ...]"
export const SUPPORTED_LOCALES = ['en', 'fr'] as const;

// uses elements of the array as possible value; [number] refers to whatever is indexed by a numeric value,
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NATIVE_NAMES: Record<SupportedLocale, string> = {
    en: 'English',
    fr: 'Français',
};

export function isSupportedLocale(value: unknown): value is SupportedLocale {
    return (SUPPORTED_LOCALES as readonly unknown[]).includes(value);
}

export interface Settings {
    /** null: no explicit choice, resolved by the consumer (browser language, fallback) */
    language: SupportedLocale | null;
    /** null: no explicit choice, the default theme applies */
    theme: ThemeId | null;
    /** null: never chosen, should be redirected to game selection, empty array -> all games */
    gameList: string[] | null;
    tableVisualAid: boolean;
}

export function createDefaultSettings(): Settings {
    return {
        language: null,
        theme: null,
        gameList: null,
        tableVisualAid: false,
    };
}

export function resolveLocale(
    preferred: SupportedLocale | null,
    browserLanguages: readonly string[],
): SupportedLocale {
    if (preferred) {
        return preferred;
    } else if (browserLanguages.length > 0) {
        return (
            browserLanguages
                .map((lang) => lang.split('-')[0]?.toLowerCase())
                .find((lang) => isSupportedLocale(lang)) ?? 'en'
        );
    } else {
        return 'en';
    }
}
