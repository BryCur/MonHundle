import type IResourceApi from '@/domain/interfaces/api-contracts/IResourceApi';
import { apiFetch, ensureOk } from './ApiBaseAccess';

export default class ResourceApi implements IResourceApi {
    public async getMonstersOptions(gameTitles: string[] = []): Promise<string[]> {
        const path = '/resources/monster-choices';
        const pathParam = gameTitles.length > 0 ? `?gameTitles=${gameTitles.join(',')}` : '';
        const response = await apiFetch(path + pathParam, { method: 'GET' });

        ensureOk(response, 'Could not get monster options');

        return (await response.json()) as string[];
    }

    public async getGameTitles(): Promise<string[]> {
        const response = await apiFetch('/resources/game-titles', { method: 'GET' });

        ensureOk(response, 'Could not get game titles');

        return (await response.json()) as string[];
    }
}
