import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";

import { apiFetch } from "./ApiBaseAccess";

export class GameApi implements IGameApi {

    constructor() {}

    newGame(): Promise<string> {
        return apiFetch("game/new", {method: "GET"})
    }

    makeGuess(monsterCode: string):  Promise<any> {
        return apiFetch("", {});
    }

    saveGame (game: Object): Promise<void> {
        return apiFetch("", {})
    }
}
