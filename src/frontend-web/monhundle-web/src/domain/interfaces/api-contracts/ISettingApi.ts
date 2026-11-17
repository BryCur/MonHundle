import type { SettingsResponse } from '@/domain/ApiModels';
import type { Settings } from '@/domain/Settings';

export default interface ISettingApi {
    updateSettings: (changes: Partial<Settings>) => Promise<void>;
    getProfile: (playerUid: string) => Promise<SettingsResponse | null>;
    loadUser: (playerUid: string) => Promise<void>;
}
