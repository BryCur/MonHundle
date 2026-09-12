import { beforeEach, describe, expect, it, vi } from "vitest";
import { DailyGameService } from "@/services/GameService";
import type IGameApi from "@/domain/interfaces/api-contracts/IGameApi";
import type { GameStore } from "@/stores/GameStore";
import type GameStatus from "@/domain/GameStatus";
import type GuessResponse from "@/domain/responses/GuessResponse";
import { GameStates } from "@/domain/enums/GameStates";
import { GameModes } from "@/domain/enums/GameModes";
import { DailyGameAlreadyExistsError } from "@/domain/errors/DailyGameAlreadyExistsError";

vi.mock("@/services/CookieService", async (importOriginal) => {
  const actual = await importOriginal() as object;
  return { ...actual, setCookie: vi.fn() };
});

import { CookieKeys, setCookie } from "@/services/CookieService";

const mockedGameApi = {
  newGame: vi.fn(),
  makeGuess: vi.fn(),
  saveGame: vi.fn(),
  resumeGame: vi.fn(),
};

const mockedGameStore = {
  game: null as any,
  setGame: vi.fn(),
  addGuess: vi.fn(),
  setState: vi.fn(),
  isGameNull: vi.fn(),
  isGameOngoing: vi.fn(),
};

function buildService() {
  return new DailyGameService(mockedGameApi as IGameApi, mockedGameStore as any as GameStore);
}

describe("DailyGameService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a Daily game and stores a cookie that expires at midnight", async () => {
    mockedGameApi.newGame.mockResolvedValueOnce("daily-1");

    const id = await buildService().startNewGame();

    expect(id).toBe("daily-1");
    expect(mockedGameStore.setGame).toHaveBeenCalledWith(
      expect.objectContaining({ gameId: "daily-1", gameMode: GameModes.Daily })
    );
    expect(setCookie).toHaveBeenCalledWith(CookieKeys.CURRENT_DAILY_GAME, "daily-1", expect.any(Number));
  });

  it("recovers by resuming the existing game when the day already has one", async () => {
    mockedGameApi.newGame.mockRejectedValueOnce(
      new DailyGameAlreadyExistsError("already exists", "existing-game")
    );
    mockedGameApi.resumeGame.mockResolvedValueOnce({ gameId: "existing-game" } as GameStatus);

    const id = await buildService().startNewGame();

    expect(id).toBe("existing-game");
    expect(mockedGameApi.resumeGame).toHaveBeenCalledWith("existing-game");
    expect(mockedGameStore.setGame).toHaveBeenCalledWith({ gameId: "existing-game" });
  });

  it("throws when the recovery resume finds no game", async () => {
    mockedGameApi.newGame.mockRejectedValueOnce(
      new DailyGameAlreadyExistsError("already exists", "existing-game")
    );
    mockedGameApi.resumeGame.mockResolvedValueOnce(null);

    await expect(buildService().startNewGame()).rejects.toThrow("game could not be set");
  });

  it("re-throws any error that is not a DailyGameAlreadyExistsError", async () => {
    mockedGameApi.newGame.mockRejectedValueOnce(new Error("network"));

    await expect(buildService().startNewGame()).rejects.toThrow("network");
    expect(mockedGameApi.resumeGame).not.toHaveBeenCalled();
  });

  it("resumeGame stores the game and returns true when a game is found", async () => {
    const game = { gameId: "d" } as GameStatus;
    mockedGameApi.resumeGame.mockResolvedValueOnce(game);

    const ok = await buildService().resumeGame("d");

    expect(ok).toBe(true);
    expect(mockedGameStore.setGame).toHaveBeenCalledWith(game);
    expect(setCookie).toHaveBeenCalledWith(CookieKeys.CURRENT_DAILY_GAME, "d", expect.any(Number));
  });

  it("resumeGame returns false and persists nothing when no game is found", async () => {
    mockedGameApi.resumeGame.mockResolvedValueOnce(null);

    const ok = await buildService().resumeGame("d");

    expect(ok).toBe(false);
    expect(mockedGameStore.setGame).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("makeGuess forwards the guess and the resulting state to the store", async () => {
    const guessResult = { monsterCode: "m", gameStateAfterGuess: GameStates.Win };
    mockedGameApi.makeGuess.mockResolvedValueOnce(guessResult as any as GuessResponse);

    await buildService().makeGuess("d", "m");

    expect(mockedGameStore.addGuess).toHaveBeenCalledWith(guessResult);
    expect(mockedGameStore.setState).toHaveBeenCalledWith(GameStates.Win);
  });
});
