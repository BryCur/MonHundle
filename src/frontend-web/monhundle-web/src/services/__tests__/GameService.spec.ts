import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameService } from "@/services/GameService"
import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";
import type GuessResponse from "@/domain/responses/GuessResponse";
import type { GameStore } from "@/stores/gameStore";
import { GameStates } from "@/domain/enums/GameStates";
import type Guess from "@/domain/Guess";
import type GameStatus from "@/domain/GameStatus";

vi.mock("@/services/CookieService", () => ({
  setCookie: vi.fn(), // on fournit une fausse implémentation
}));

import { setCookie } from "@/services/CookieService";

const mockedGameApi = {
    newGame: vi.fn(),
    makeGuess: vi.fn(),
    saveGame: vi.fn(),
    resumeGame: vi.fn()
}

const mockedGameStore = {
    game: null as any,
    setGame: vi.fn(), 
    addGuess: vi.fn(), 
    setState: vi.fn(), 
    isGameNull: vi.fn(), 
    isGameOngoing: vi.fn()
}

describe("GameService", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should call the api and set the store when starting a new game", async () =>{
        const testGameId = "abc";
        mockedGameApi.newGame.mockResolvedValueOnce(testGameId);

        const gameService = new GameService(mockedGameApi as IGameApi, mockedGameStore as any as GameStore)
        let gameId: string = "";
        await gameService.startNewGame().then(r => gameId = r);

        expect(gameId).toStrictEqual(testGameId);
        expect(mockedGameApi.newGame).toHaveBeenCalled();
        expect(mockedGameStore.setGame).toHaveBeenCalled();
        expect(setCookie).toHaveBeenCalledWith("currentGame", testGameId);
    });

    it("should send the guess and update the store", async () =>{
        const testGid = "gid";
        const testMonstercode = "monster";
        const testGuessResult = {
            monsterCode: testMonstercode,
            gameStateAfterGuess: GameStates.Ongoing
        };

        mockedGameApi.makeGuess.mockResolvedValueOnce(testGuessResult as GuessResponse);

        const gameService = new GameService(mockedGameApi as IGameApi, mockedGameStore as any as GameStore);
        await gameService.makeGuess(testGid, testMonstercode);

        expect(mockedGameApi.makeGuess).toHaveBeenCalledWith(testGid, testMonstercode);
        expect(mockedGameStore.addGuess).toHaveBeenCalledWith(testGuessResult as any as Guess);
        expect(mockedGameStore.setState).toHaveBeenCalledWith(GameStates.Ongoing);
    });

    it("should resume and unfinished game", async () =>{
        const testGid = "gid";
        const testGame = {
            gameId: testGid,
            guesses: [] as Guess[],
            state: GameStates.Ongoing
        };
        let result: boolean = false;

        mockedGameApi.resumeGame.mockResolvedValueOnce(testGame as GameStatus);
        mockedGameStore.isGameOngoing.mockReturnValueOnce(true);

        const gameService = new GameService(mockedGameApi as IGameApi, mockedGameStore as any as GameStore);
        await gameService.resumeGame(testGid).then(r => result = r);

        expect(result).toBeTruthy();
        expect(mockedGameApi.resumeGame).toHaveBeenCalledWith(testGid);
        expect(mockedGameStore.setGame).toHaveBeenCalledWith(testGame as GameStatus);
        expect(setCookie).toHaveBeenCalledWith("currentGame", testGid);
    });

    it("should return false if no game found", async () =>{
        const testGid = "gid";
        let result: boolean = true;

        mockedGameApi.resumeGame.mockResolvedValueOnce(null);

        const gameService = new GameService(mockedGameApi as IGameApi, mockedGameStore as any as GameStore);
        await gameService.resumeGame(testGid).then(r => result = r);

        expect(result).toBeFalsy();
        expect(mockedGameApi.resumeGame).toHaveBeenCalledWith(testGid);
        expect(mockedGameStore.setGame).not.toHaveBeenCalled();
        expect(setCookie).not.toHaveBeenCalled();
    });
});
