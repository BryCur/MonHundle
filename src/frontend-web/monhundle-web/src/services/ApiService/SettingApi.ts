import type ISettingApi from '@/domain/interfaces/api-contracts/ISettingApi';
import type { SettingsResponse, UserSettingsBody } from '@/domain/ApiModels';
import { isUUID } from '@/domain/Utils';
import { apiFetch, ensureOk } from '@/services/ApiService/ApiBaseAccess';
import { setStoredUserId } from '@/services/LocalStorageService';

export class SettingsApi implements ISettingApi {
    public async saveSettings(enableTableVisualAid: boolean, gameTitles: string[]): Promise<void> {
        const settingsBody: UserSettingsBody = { enableTableVisualAid, gameTitles };
        const response = await apiFetch('/user/preference', {
            method: 'POST',
            body: JSON.stringify(settingsBody),
        });
        ensureOk(response, 'Error while saving settings');
    }

    // TODO in service: make sure the format is OK for uid, notification if not ok
    public async getProfile(playerUid: string): Promise<SettingsResponse | null> {
        const response = await apiFetch(`/user/profile/${playerUid}`, { method: 'GET' });

        if (response.status === 404) {
            return null;
        }

        ensureOk(response, `Unexpected error while fetching player profile ${playerUid}`);

        return (await response.json()) as SettingsResponse;
    }

    public async loadUser(userUid: string): Promise<void> {
        const urlParam = new URLSearchParams({ 'user-id': userUid });
        const response = await apiFetch(`/user/load?${urlParam.toString()}`, { method: 'GET' });

        ensureOk(response, `Unexpected error while loading profile ${userUid}`);

        // switch the locally stored identity so following requests authenticate as the loaded user.
        // Parse defensively and fall back to the (already validated) requested id.
        let loadedUserId: unknown;
        try {
            loadedUserId = JSON.parse(await response.text());
        } catch {
            loadedUserId = undefined;
        }

        setStoredUserId(
            typeof loadedUserId === 'string' && isUUID(loadedUserId) ? loadedUserId : userUid,
        );
    }
}
