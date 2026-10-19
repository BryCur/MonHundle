export default interface IResourceService {
    getAllGameTitles: () => Promise<string[]>;
    getMonsterOptions: (gameTitles?: string[]) => Promise<string[]>;
}
