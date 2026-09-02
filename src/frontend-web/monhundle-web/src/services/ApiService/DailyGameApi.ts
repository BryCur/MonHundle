import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";

import { apiFetch } from "./ApiBaseAccess";
import type Guess from "@/domain/Guess";
import type GuessResponse from "@/domain/responses/GuessResponse";
import GameStatus from "@/domain/GameStatus";
import { DailyGameAlreadyExistsError } from "@/domain/errors/DailyGameAlreadyExistsError";
import type GameStateResponse from "@/domain/responses/GameStateResponse";

export class DailyGameApi implements IGameApi {

    constructor() {}

    public async newGame(): Promise<string> {
        const response = await apiFetch("/game/daily/start", { method: "POST", credentials: 'include'})

        if(response.ok) {
            return response.json();
        } else if (response.status === 409) {
            throw new DailyGameAlreadyExistsError("Could not create daily game for today", await response.json() as string);
        } else {
            throw new Error("unexpected error while creating new daily game")
        }

    }

    public async makeGuess(gameId: string, monsterCode: string):  Promise<GuessResponse> {
        const guessRequestBody = {"gameId": gameId, "guessId": monsterCode}
        const guessResponse = await apiFetch("/game/daily/guess", { method: "POST", body: JSON.stringify(guessRequestBody)});

        return guessResponse.json() as GuessResponse;
    }

    public async saveGame (game: GameStatus): Promise<void> {
        return await apiFetch("", {})
    }

    public async resumeGame (gameId: string): Promise<GameStatus | null> {
        const response: Response = await apiFetch(`/game/daily/resume/${gameId}`, { method: "GET", credentials: 'include'})
        if (response.ok) {
            let resp = await response.json() as GameStateResponse
            return  new GameStatus(resp.gameId, resp.gameMode, resp.guesses, resp.state);
        }

        return null;
    }
}
