import type { Settings } from '@/domain/Settings';

export default interface ISettingsStorage {
    /**
     * Reads the persisted settings. Never throws: missing or invalid values fall back to their default.
     * @returns the stored settings, or the default settings if nothing usable is stored
     */
    load: () => Settings;

    /**
     * Persists the given settings. Never throws: a failed write is only logged.
     * @param settings settings to persist, replacing the stored ones
     */
    save: (settings: Settings) => void;

    /**
     * Removes every persisted setting.
     */
    clear: () => void;
}
