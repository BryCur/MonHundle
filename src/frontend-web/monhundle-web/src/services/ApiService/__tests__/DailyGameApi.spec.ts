import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/ApiService/ApiBaseAccess", () => ({
  apiFetch: vi.fn(),
}));

import { DailyGameApi } from "@/services/ApiService/DailyGameApi";
import { apiFetch } from "@/services/ApiService/ApiBaseAccess";
import GameStatus from "@/domain/GameStatus";
import { DailyGameAlreadyExistsError } from "@/domain/errors/DailyGameAlreadyExistsError";
import { GameModes } from "@/domain/enums/GameModes";
import { GameStates } from "@/domain/enums/GameStates";

const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

async function rejection(promise: Promise<unknown>): Promise<any> {
  return promise.then(
    () => {
      throw new Error("expected the promise to reject");
    },
    (err) => err,
  );
}

describe("DailyGameApi", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("newGame", () => {
    it("returns the new game id on success", async () => {
      apiFetchMock.mockResolvedValue({ ok: true, json: async () => "daily-1" });

      await expect(new DailyGameApi().newGame()).resolves.toBe("daily-1");
      expect(apiFetchMock).toHaveBeenCalledWith("/game/daily/start", { method: "POST" });
    });

    it("throws DailyGameAlreadyExistsError carrying the existing id on a 409", async () => {
      apiFetchMock.mockResolvedValue({ ok: false, status: 409, json: async () => "existing-9" });

      const error = await rejection(new DailyGameApi().newGame());

      expect(error).toBeInstanceOf(DailyGameAlreadyExistsError);
      expect(error.getExistingGameId).toBe("existing-9");
    });

    it("throws a generic error on any other non-ok status", async () => {
      apiFetchMock.mockResolvedValue({ ok: false, status: 500 });

      await expect(new DailyGameApi().newGame()).rejects.toThrow(/unexpected error/);
    });
  });

  describe("resumeGame", () => {
    it("builds a GameStatus from the response body when ok", async () => {
      apiFetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ gameId: "g1", gameMode: GameModes.Daily, guesses: [], state: GameStates.Ongoing }),
      });

      const result = await new DailyGameApi().resumeGame("g1");

      expect(result).toBeInstanceOf(GameStatus);
      expect(result?.gameId).toBe("g1");
      expect(result?.gameMode).toBe(GameModes.Daily);
    });

    it("returns null when the response is not ok", async () => {
      apiFetchMock.mockResolvedValue({ ok: false });

      await expect(new DailyGameApi().resumeGame("g1")).resolves.toBeNull();
    });
  });

  it("makeGuess posts the game id and monster code", async () => {
    apiFetchMock.mockResolvedValue({ json: async () => ({ monsterCode: "m", gameStateAfterGuess: GameStates.Ongoing }) });

    await new DailyGameApi().makeGuess("g1", "rathalos");

    expect(apiFetchMock).toHaveBeenCalledWith("/game/daily/guess", {
      method: "POST",
      body: JSON.stringify({ gameId: "g1", guessId: "rathalos" }),
    });
  });
});
