import type en from '@/locales/en.json';

/** Union of the dotted paths to every leaf of `T` (e.g. `'ui.page.error.action.retry'`). */
type Paths<T> = {
    [K in keyof T & string]: T[K] extends Record<string, unknown> ? `${K}.${Paths<T[K]>}` : K;
}[keyof T & string];

/** Any translation key existing in en.json, the reference locale. */
export type TranslationKey = Paths<typeof en>;
