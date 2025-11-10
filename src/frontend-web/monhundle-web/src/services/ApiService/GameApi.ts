import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";

import { apiFetch } from "./ApiBaseAccess";
import type Guess from "@/domain/Guess";

export class GameApi implements IGameApi {

    constructor() {}

    public async newGame(): Promise<string> {
        const response = await apiFetch("/game/start", { method: "POST", credentials: 'include'})
        return response.json() as string;
    }

    public async makeGuess(gameId: string, monsterCode: string):  Promise<Guess> {
        const guessRequestBody = {"gameId": gameId, "guessId": monsterCode}
        const guessResponse = await apiFetch("/game/guess", { method: "POST", body: JSON.stringify(guessRequestBody)});

        return guessResponse.json() as Guess;
    }

    saveGame (game: Object): Promise<void> {
        return apiFetch("", {})
    }
}
