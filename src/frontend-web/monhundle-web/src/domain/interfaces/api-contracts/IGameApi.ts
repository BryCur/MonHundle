import type Guess from "@/domain/Guess";

export default interface IGameApi {
    newGame: () => Promise<string>; // return game ID
    makeGuess: (gameId:string, monsterCode: string) => Promise<Guess>;
    saveGame: (game: Object) => Promise<void>;
}