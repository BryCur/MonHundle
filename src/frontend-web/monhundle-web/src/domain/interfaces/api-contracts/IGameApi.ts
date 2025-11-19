import type GameStatus from "@/domain/GameStatus";
import type GuessResponse from "@/domain/responses/GuessResponse";

export default interface IGameApi {
    newGame: () => Promise<string>; // return game ID
    resumeGame: (gameId: string) => Promise<GameStatus | null>;
    makeGuess: (gameId:string, monsterCode: string) => Promise<GuessResponse>;
    saveGame: (game: GameStatus) => Promise<void>;
}