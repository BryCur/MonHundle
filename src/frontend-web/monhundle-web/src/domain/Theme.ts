// "as const" adds the values in the type, turns the type from "string[]" into "readonly ['classic', ...]"
export const THEME_IDS = ['classic'] as const;

// uses elements of the array as possible value; [number] refers to whatever is indexed by a numeric value as an union
// equivalent to "'classic' | ..."" but without maintenance needed
export type ThemeId = (typeof THEME_IDS)[number];

export function isThemeId(value: unknown): value is ThemeId {
    return (THEME_IDS as readonly unknown[]).includes(value);
}
