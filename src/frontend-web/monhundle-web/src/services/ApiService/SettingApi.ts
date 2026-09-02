import type ISettingApi from '@/domain/interfaces/api-contracts/ISettingApi';
import type { UserSettingsBody } from '@/domain/requestBodies/UserSettingsBody';
import type SettingsResponse from '@/domain/responses/SettingsResponse';
import { apiFetch } from '@/services/ApiService/ApiBaseAccess';
import { setStoredUserId } from '@/services/LocalStorageService';

export class SettingsApi implements ISettingApi {

    public async saveSettings(enableTableVisualAid: boolean, gameTitles: string[]): Promise<void> {
        const settingsBody: UserSettingsBody = {enableTableVisualAid, gameTitles}
        apiFetch('/user/preference', {method: 'POST', body: JSON.stringify(settingsBody)})
    }

    public async getProfile(playerUid: string): Promise<SettingsResponse | null> {
        const response = await apiFetch(`/user/profile/${playerUid}`, {method: 'GET'});

        if (response.ok) {
            return response.json() as SettingsResponse;
        }

        return null;
    }

    public async validateUser(userUid: string) : Promise<boolean> {
        const urlParam = new URLSearchParams({'user-id': userUid});
        const response = await apiFetch(`/user/validate?${urlParam.toString()}`, {method: 'GET'})

        return response.status === 200;
    }

    public async loadUser(userUid: string): Promise<void> {
        const urlParam = new URLSearchParams({'user-id': userUid});
        const response = await apiFetch(`/user/load?${urlParam.toString()}` , {method: 'GET'})

        if (response.ok) {
            // switch the locally stored identity so following requests authenticate as the loaded user
            const loadedUserId = await response.json() as string;
            setStoredUserId(loadedUserId || userUid);
        }
    }
    
}