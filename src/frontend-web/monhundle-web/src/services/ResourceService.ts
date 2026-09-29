import type IResourceApi from '@/domain/interfaces/api-contracts/IResourceApi';

export class ResourceService {
    private readonly resourceApi: IResourceApi;

    constructor(resourceApi: IResourceApi) {
        this.resourceApi = resourceApi;
    }

    public async getAllGameTitle(): Promise<string[]> {
        try {
            return await this.resourceApi.getGameTitles();
        } catch (err) {
            console.error(err);

            // TODO emit notification for user feedback
            return [];
        }
    }

    public async getAllMonsterOptions(): Promise<string[]> {
        try {
            return await this.resourceApi.getMonstersOptions();
        } catch (err) {
            console.error(err);

            // TODO emit notification for user feedback
            // TODO move to error page?
            return [];
        }
    }

    public async getMonsterOptionsFromTitles(gameTitles: string[]) {
        if (gameTitles.length < 1) {
            throw Error('game title list should not be empty.');
        }

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
