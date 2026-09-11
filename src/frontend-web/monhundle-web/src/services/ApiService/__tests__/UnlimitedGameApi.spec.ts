import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/ApiService/ApiBaseAccess", () => ({
  apiFetch: vi.fn(),
}));

import { UnlimitedGameApi } from "@/services/ApiService/UnlimitedGameApi";
import { apiFetch } from "@/services/ApiService/ApiBaseAccess";
import GameStatus from "@/domain/GameStatus";
import { GameModes } from "@/domain/enums/GameModes";
import { GameStates } from "@/domain/enums/GameStates";

const apiFetchMock = apiFetch as unknown as ReturnType<typeof vi.fn>;

describe("UnlimitedGameApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("newGame posts to the unlimited start endpoint and returns the id", async () => {
    apiFetchMock.mockResolvedValue({ json: async () => "unlimited-1" });

    await expect(new UnlimitedGameApi().newGame()).resolves.toBe("unlimited-1");
    expect(apiFetchMock).toHaveBeenCalledWith("/game/unlimited/start", { method: "POST" });
  });

  describe("resumeGame", () => {
    it("builds a GameStatus from the response body when ok", async () => {
      apiFetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ gameId: "g1", gameMode: GameModes.Unlimited, guesses: [], state: GameStates.Ongoing }),
      });

      const result = await new UnlimitedGameApi().resumeGame("g1");

      expect(result).toBeInstanceOf(GameStatus);
      expect(result?.gameId).toBe("g1");
    });

    it("returns null when the response is not ok", async () => {
      apiFetchMock.mockResolvedValue({ ok: false });

      await expect(new UnlimitedGameApi().resumeGame("g1")).resolves.toBeNull();
    });
  });

  it("makeGuess posts the game id and monster code", async () => {
    apiFetchMock.mockResolvedValue({ json: async () => ({ monsterCode: "m", gameStateAfterGuess: GameStates.Ongoing }) });

    await new UnlimitedGameApi().makeGuess("g1", "rathalos");

    expect(apiFetchMock).toHaveBeenCalledWith("/game/unlimited/guess", {
      method: "POST",
      body: JSON.stringify({ gameId: "g1", guessId: "rathalos" }),
    });
  });
});
