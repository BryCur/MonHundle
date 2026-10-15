import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';
import type IResourceApi from '@/domain/interfaces/api-contracts/IResourceApi';

export class ResourceService {
    private readonly resourceApi: IResourceApi;

    constructor(resourceApi: IResourceApi) {
        this.resourceApi = resourceApi;
    }

    public async getAllGameTitles(): Promise<string[]> {
        try {
            return await this.resourceApi.getGameTitles();
        } catch (err) {
            if (err instanceof UnexpectedApiError) {
                throw new LoadFailedError('Could not load game titles', 'AllGameTitle', {
                    cause: err,
                });
            }
            throw err;
        }
    }

    public async getMonsterOptions(gameTitles: string[] = []): Promise<string[]> {
        try {
            return await this.resourceApi.getMonstersOptions(gameTitles);
        } catch (err) {
            if (err instanceof UnexpectedApiError) {
                throw new LoadFailedError('Could not load monster options', 'MonsterOptions', {
                    cause: err,
                });
            }
            throw err;
        }
    }
}
