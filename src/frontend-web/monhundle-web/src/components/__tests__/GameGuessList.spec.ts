import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: "en" }
  })
}))

import GameGuessList from "@/components/game-elements/GameGuessList.vue";
import { ComparisonResults } from "@/domain/enums/ComparisonResults";
import { Weaknesses } from "@/domain/enums/Criterias/Weaknesses";
import { Afflictions } from "@/domain/enums/Criterias/Afflictions";
import { Biomes } from "@/domain/enums/Criterias/Biomes";
import { Classifications } from "@/domain/enums/Criterias/Classifications";
import type Guess from "@/domain/Guess";

const sampleGuesses = [
  {
    monsterCode: "rathalos",
    criterias: {
      generation: 1,
      threatLevel: 5,
      classification: Classifications.FlyingWyvern,
      weaknesses: [Weaknesses.Dragon,Weaknesses.Thunder],
      afflictions: [Afflictions.Poison, Afflictions.Fire],
      habitats: [Biomes.Forest, Biomes.Volcano]
    },
    comparisonResult: {
      generation: ComparisonResults.Correct,
      threatLevel: ComparisonResults.Higher,
      classification: ComparisonResults.Correct,
      weaknesses: ComparisonResults.Partial,
      afflictions: ComparisonResults.Correct,
      habitats: ComparisonResults.Incorrect
    }
  },
  {
    monsterCode: "nargacuga",
    criterias: {
      generation: 2,
      threatLevel: 5,
      classification: Classifications.FlyingWyvern,
      weaknesses: [Weaknesses.Fire, Weaknesses.Thunder],
      afflictions: [],
      habitats: [Biomes.Forest]
    },
    comparisonResult: {
      generation: ComparisonResults.Correct,
      threatLevel: ComparisonResults.Lower,
      classification: ComparisonResults.Correct,
      weaknesses: ComparisonResults.Partial,
      afflictions: ComparisonResults.Correct,
      habitats: ComparisonResults.Incorrect
    }
  }
] as Guess[];

describe("GameGuessList", () => {
  it("should not display instruction nor table when there are no guesses", ()=>{
    const wrapper = mount(GameGuessList, {
      props: {
        modelValue: []
      }
    });

    const instructions = wrapper.findAll(".game-lexic");
    const table = wrapper.findAll(".guess-table");
    expect(table.length).toBe(0);
    expect(instructions.length).toBe(0);
  });

  it("renders the correct number of rows", async () => {
    const wrapper = mount(GameGuessList, {
      props: {
        modelValue: sampleGuesses
      }
    });

    const rows = wrapper.findAll(".guess-table-row");
    expect(rows.length).toBe(1 + sampleGuesses.length); // length +1 for the header line
  });

  it("displays guesses in reverse orders", async () => {
    const wrapper = mount(GameGuessList, {
      props: {
        modelValue: sampleGuesses
      }
    });

    const monsterCells = wrapper
      .findAll(".guess-table-monster-cell")
      .map(cell => cell.find(".guess-table-cell-content").text());

    const reverseTranslatedList = sampleGuesses.slice().reverse().map(m => `game.monster.${m.monsterCode}.name`);
    expect(monsterCells).toStrictEqual(reverseTranslatedList);
  });

  it("ajoute les bonnes classes de résultat", () => {
    const wrapper = mount(GameGuessList, {
      props: {
        modelValue: sampleGuesses
      }
    });

    const resultPartial = wrapper.find(".result-partial");
    const resultHigher = wrapper.find(".result-higher");
    const resultLower = wrapper.find(".result-lower");
    const resultCorrect = wrapper.find(".result-correct");
    const resultIncorrect = wrapper.find(".result-incorrect");


    expect(resultPartial).toBeDefined();
    expect(resultHigher).toBeDefined();
    expect(resultLower).toBeDefined();
    expect(resultCorrect).toBeDefined();
    expect(resultIncorrect).toBeDefined();
  });
})
