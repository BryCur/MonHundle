
export default interface IGameApi {
    newGame: () => Promise<string>; // return game ID
    makeGuess: (monsterCode: string) => Promise<any>;
    saveGame: (game: Object) => Promise<void>;
}