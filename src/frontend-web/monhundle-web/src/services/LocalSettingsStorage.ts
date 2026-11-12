import type ISettingsStorage from '@/domain/interfaces/services/ISettingsStorage';
import { createDefaultSettings, isSupportedLocale, type Settings } from '@/domain/Settings';
import { isThemeId } from '@/domain/Theme';
import { LocalStorageKeys } from '@/services/LocalStorageService';

const CURRENT_VERSION = 1;

// one key per setting, used before the settings were grouped under LocalStorageKeys.SETTINGS
const LEGACY_GAME_LIST_KEY = 'gameList';
const LEGACY_TABLE_VISUAL_AID_KEY = 'enableTableVisualA11y';

export class LocalSettingsStorage implements ISettingsStorage {
    public load(): Settings {
        try {
            const stored = localStorage.getItem(LocalStorageKeys.SETTINGS);
            return stored === null ? this.loadLegacy() : this.parseStored(stored);
        } catch (err) {
            console.warn('could not read the stored settings', err);
            return createDefaultSettings();
        }
    }

    public save(settings: Settings): void {
        try {
            localStorage.setItem(
                LocalStorageKeys.SETTINGS,
                JSON.stringify({
                    version: CURRENT_VERSION,
                    language: settings.language,
                    theme: settings.theme,
                    gameList: settings.gameList,
                    tableVisualAid: settings.tableVisualAid,
                }),
            );
            // only once the new key is written, so a failed write never loses the legacy values
            this.removeLegacyKeys();
        } catch (err) {
            console.warn('could not persist the settings', err);
        }
    }

    public clear(): void {
        try {
            localStorage.removeItem(LocalStorageKeys.SETTINGS);
            this.removeLegacyKeys();
        } catch (err) {
            console.warn('could not clear the stored settings', err);
        }
    }

    private parseStored(stored: string): Settings {
        const parsed = this.parseJson(stored);

        if (!this.isRecord(parsed) || parsed.version !== CURRENT_VERSION) {
            console.warn('stored settings are corrupted or of an unknown version, using defaults');
            return createDefaultSettings();
        }

        return this.sanitize(parsed);
    }

    private loadLegacy(): Settings {
        const gameList = localStorage.getItem(LEGACY_GAME_LIST_KEY);
        const tableVisualAid = localStorage.getItem(LEGACY_TABLE_VISUAL_AID_KEY);

        return this.sanitize({
            gameList: gameList === null ? null : this.parseJson(gameList),
            tableVisualAid: tableVisualAid?.toLowerCase() === 'true',
        });
    }

    // each field is checked on its own: an invalid one falls back to its default without affecting the others
    private sanitize(raw: Record<string, unknown>): Settings {
        const defaults = createDefaultSettings();

        return {
            language: isSupportedLocale(raw.language) ? raw.language : defaults.language,
            theme: isThemeId(raw.theme) ? raw.theme : defaults.theme,
            gameList: Array.isArray(raw.gameList)
                ? raw.gameList.filter((game): game is string => typeof game === 'string')
                : defaults.gameList,
            tableVisualAid:
                typeof raw.tableVisualAid === 'boolean'
                    ? raw.tableVisualAid
                    : defaults.tableVisualAid,
        };
    }

    private parseJson(raw: string): unknown {
        try {
            return JSON.parse(raw);
        } catch {
            return undefined;
        }
    }

    private isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    private removeLegacyKeys(): void {
        localStorage.removeItem(LEGACY_GAME_LIST_KEY);
        localStorage.removeItem(LEGACY_TABLE_VISUAL_AID_KEY);
    }
}
