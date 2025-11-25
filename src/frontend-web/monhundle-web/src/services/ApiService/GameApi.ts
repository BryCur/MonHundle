import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";

import { apiFetch } from "./ApiBaseAccess";
import type Guess from "@/domain/Guess";
import type GuessResponse from "@/domain/responses/GuessResponse";
import GameStatus from "@/domain/GameStatus";

export class GameApi implements IGameApi {

    constructor() {}

    public async newGame(): Promise<string> {
        const response = await apiFetch("/game/start", { method: "POST", credentials: 'include'})
        return response.json() as string;
    }

    public async makeGuess(gameId: string, monsterCode: string):  Promise<GuessResponse> {
        const guessRequestBody = {"gameId": gameId, "guessId": monsterCode}
        const guessResponse = await apiFetch("/game/guess", { method: "POST", body: JSON.stringify(guessRequestBody)});

        return guessResponse.json() as GuessResponse;
    }

    public async saveGame (game: GameStatus): Promise<void> {
        return await apiFetch("", {})
    }

    public async resumeGame (gameId: string): Promise<GameStatus | null> {
        const response: Response = await apiFetch(`/game/resume/${gameId}`, { method: "GET", credentials: 'include'})
        if (response.ok) {
            let resp = await response.json() as GameStatus
            return  new GameStatus(resp.gameId, resp.guesses, resp.state);
        }

        return null;
    }
}
