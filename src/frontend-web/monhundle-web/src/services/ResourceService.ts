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
            console.error(err);

            // TODO emit notification for user feedback
            return [];
        }
    }

    public async getMonsterOptions(gameTitles: string[] = []): Promise<string[]> {
        try {
            return await this.resourceApi.getMonstersOptions(gameTitles);
        } catch (err) {
            console.error(err);

            // TODO emit notification for user feedback
            // TODO move to error page?
            return [];
        }
    }
}
