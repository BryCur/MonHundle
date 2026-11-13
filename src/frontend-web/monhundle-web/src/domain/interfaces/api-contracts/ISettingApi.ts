import type { SettingsResponse } from '@/domain/ApiModels';
import type { Settings } from '@/domain/Settings';

export default interface ISettingApi {
    saveSettings: (enableA11y: boolean, gameTitles: string[]) => Promise<void>;
    updateSettings: (changes: Partial<Settings>) => Promise<void>;
    getProfile: (playerUid: string) => Promise<SettingsResponse | null>;
    loadUser: (playerUid: string) => Promise<void>;
}
