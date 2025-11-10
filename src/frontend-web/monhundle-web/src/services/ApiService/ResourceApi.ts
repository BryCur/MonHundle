import type IResourceApi from "@/domain/interfaces/api-contracts/IResourceApi";
import { apiFetch } from "./ApiBaseAccess";

export default class ResourceApi implements IResourceApi {

    public async getMonstersOptions(gameTitles: string[]): Promise<string[]> {
         const response = await apiFetch(`/resources/monster-choices?gameTitles=${gameTitles.join(",")}`,  { method: "GET", credentials: 'include'})
         return response.json() as string[]
    }

    public async getGameTitles(): Promise<string[]>{
        const response = await apiFetch("/resources/game-titles", { method: "GET"})
        return response.json() as string[]
    }
}