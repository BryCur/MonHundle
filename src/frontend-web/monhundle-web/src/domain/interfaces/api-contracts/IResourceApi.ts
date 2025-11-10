export default interface IResourceApi {
    getMonstersOptions: (gameTitles: string[]) => Promise<string[]>;
    getGameTitles:() => Promise<string[]>;
}