// "as const" adds the values in the type, turns the type from "string[]" into "readonly ['classic-dark', ...]"
// each id matches a stylesheet in src/assets/themes/<id>.css
export const THEME_IDS = ['classic-dark'] as const;

// uses elements of the array as possible value; [number] refers to whatever is indexed by a numeric value as an union
// equivalent to "'classic-dark' | ..." but without maintenance needed
export type ThemeId = (typeof THEME_IDS)[number];

/** applied when the player made no explicit choice */
export const DEFAULT_THEME: ThemeId = 'classic-dark';

export function isThemeId(value: unknown): value is ThemeId {
    return (THEME_IDS as readonly unknown[]).includes(value);
}

/** the theme to apply: the explicit choice, or the default one */
export function resolveTheme(preferred: ThemeId | null): ThemeId {
    return preferred ?? DEFAULT_THEME;
}
