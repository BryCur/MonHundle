import type IResourceApi from '@/domain/interfaces/api-contracts/IResourceApi';
import { apiFetch } from './ApiBaseAccess';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';

export default class ResourceApi implements IResourceApi {
    public async getMonstersOptions(gameTitles: string[] = []): Promise<string[]> {
        const path = '/resources/monster-choices';
        const pathParam = gameTitles.length > 0 ? `?gameTitles=${gameTitles.join(',')}` : '';
        const response = await apiFetch(path + pathParam, { method: 'GET' });

        if (!response.ok) {
            throw new UnexpectedApiError('Could not get monster options', response.status);
        }

        return (await response.json()) as string[];
    }

    public async getGameTitles(): Promise<string[]> {
        const response = await apiFetch('/resources/game-titles', { method: 'GET' });

        if (!response.ok) {
            throw new UnexpectedApiError('Could not get game titles', response.status);
        }

        return (await response.json()) as string[];
    }
}
