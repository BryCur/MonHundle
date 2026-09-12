import { describe, expect, it } from "vitest";
import GameStatus from "@/domain/GameStatus";
import { GameModes } from "@/domain/enums/GameModes";
import { ComparisonResults } from "@/domain/enums/ComparisonResults";
import type Guess from "@/domain/Guess";

function guessWithResults(comparisonResult: Record<string, ComparisonResults>): Guess {
  return { monsterCode: "rathalos", criterias: {}, comparisonResult } as unknown as Guess;
}

describe("GameStatus", () => {
  it("appends guesses in order via addguess", () => {
    const game = new GameStatus("abc", GameModes.Unlimited);

    game.addguess({ monsterCode: "a" } as Guess);
    game.addguess({ monsterCode: "b" } as Guess);

    expect(game.guesses.map((g) => g.monsterCode)).toEqual(["a", "b"]);
  });

  describe("convertGameToShareableString", () => {
    it("maps each comparison result to its emoji, in criterion order, one line per guess", () => {
      const game = new GameStatus("abc", GameModes.Unlimited, [
        guessWithResults({
          classification: ComparisonResults.Correct,
          generation: ComparisonResults.Incorrect,
          weaknesses: ComparisonResults.Higher,
          afflictions: ComparisonResults.Lower,
          threatLevel: ComparisonResults.Partial,
          habitats: ComparisonResults.Correct,
        }),
      ]);

      // order: classification, generation, weaknesses, afflictions, threatLevel, habitats
      expect(game.convertGameToShareableString()).toBe("🟩🟥🔺🔻🟨🟩\n");
    });

    it("produces one line per guess", () => {
      const allCorrect = {
        classification: ComparisonResults.Correct,
        generation: ComparisonResults.Correct,
        weaknesses: ComparisonResults.Correct,
        afflictions: ComparisonResults.Correct,
        threatLevel: ComparisonResults.Correct,
        habitats: ComparisonResults.Correct,
      };
      const game = new GameStatus("abc", GameModes.Unlimited, [
        guessWithResults(allCorrect),
        guessWithResults(allCorrect),
      ]);

      expect(game.convertGameToShareableString()).toBe("🟩🟩🟩🟩🟩🟩\n🟩🟩🟩🟩🟩🟩\n");
    });

    it("returns an empty string when there are no guesses", () => {
      const game = new GameStatus("abc", GameModes.Unlimited);

      expect(game.convertGameToShareableString()).toBe("");
    });
  });
});
