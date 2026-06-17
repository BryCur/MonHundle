import type SettingsResponse from '@/domain/responses/SettingsResponse';


export default interface ISettingApi {
    saveSettings: (enableA11y: boolean, gameTitles: string[]) => Promise<void>;
    getProfile: (playerUid: string) => Promise<SettingsResponse | null>;
    validateUser: (playerUid: string) => Promise<boolean>;
    loadUser: (playerUid: string) => Promise<void>;

}