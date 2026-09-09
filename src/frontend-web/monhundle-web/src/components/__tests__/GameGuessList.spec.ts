import { describe, it, expect, vi } from "vitest";
import { mount, type VueWrapper, type DOMWrapper } from "@vue/test-utils";

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

// one guess with a different comparison result on every criterion, so a cell picking up
// the wrong result (cross-wiring) is caught.
const guessWithDistinctResults = {
  monsterCode: "rathalos",
  criterias: {
    generation: 3,
    threatLevel: 5,
    classification: Classifications.FlyingWyvern,
    weaknesses: [Weaknesses.Dragon],
    afflictions: [Afflictions.Fire],
    habitats: [Biomes.Volcano]
  },
  comparisonResult: {
    classification: ComparisonResults.Correct,
    generation: ComparisonResults.Higher,
    weaknesses: ComparisonResults.Partial,
    afflictions: ComparisonResults.Incorrect,
    threatLevel: ComparisonResults.Lower,
    habitats: ComparisonResults.Correct
  }
} as Guess;

// data rows live under .guess-container; the first one is the sticky column header.
// cells: [0] monster, then classification, generation, weaknesses, afflictions, threatLevel, habitats
function getFirstRowDataCells(wrapper: VueWrapper<any>) {
  const rows = wrapper.findAll(".guess-container .guess-table-row") as DOMWrapper<Element>[];
  const row = rows.find(r => !r.classes().includes("table-header"))!;
  return row.findAll(".guess-table-cell");
}

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

    const rows = wrapper.findAll(".guess-container .guess-table-row");
    expect(rows.length).toBe(1 + sampleGuesses.length); // length +1 for the header line & lexic
  });

  it("displays guesses in reverse orders", async () => {
    const wrapper = mount(GameGuessList, {
      props: {
        modelValue: sampleGuesses
      }
    });

    const monsterCells = wrapper
      .findAll(".guess-container .guess-table-monster-cell")
      .map(cell => cell.find(".guess-table-cell-content").text());

    const reverseTranslatedList = sampleGuesses.slice().reverse().map(m => `game.monster.${m.monsterCode}.name`);
    expect(monsterCells).toStrictEqual(reverseTranslatedList);
  });

  it("maps each criterion cell to the result class of its own comparison result", () => {
    const wrapper = mount(GameGuessList, {
      props: {
        modelValue: [guessWithDistinctResults]
      }
    });

    const cells = getFirstRowDataCells(wrapper);

    expect(cells[1]!.classes()).toContain("result-correct");   // classification
    expect(cells[2]!.classes()).toContain("result-higher");    // generation
    expect(cells[3]!.classes()).toContain("result-partial");   // weaknesses
    expect(cells[4]!.classes()).toContain("result-incorrect"); // afflictions
    expect(cells[5]!.classes()).toContain("result-lower");     // threatLevel
    expect(cells[6]!.classes()).toContain("result-correct");   // habitats
  });

  it("adds accessibility classes to the result cells when accessibilityEnabled is set", () => {
    const wrapper = mount(GameGuessList, {
      props: {
        modelValue: [guessWithDistinctResults],
        accessibilityEnabled: true
      }
    });

    const classificationCell = getFirstRowDataCells(wrapper)[1]!;

    expect(classificationCell.classes()).toContain("accessibility-on");
    expect(classificationCell.classes()).toContain("accessibility-correct");
  });

  it("omits accessibility classes by default", () => {
    const wrapper = mount(GameGuessList, {
      props: {
        modelValue: [guessWithDistinctResults]
      }
    });

    const classificationCell = getFirstRowDataCells(wrapper)[1]!;

    expect(classificationCell.classes()).not.toContain("accessibility-on");
    expect(classificationCell.classes()).not.toContain("accessibility-correct");
  });

  it("renders a dash for a criterion whose list is empty", () => {
    const guess = {
      ...guessWithDistinctResults,
      criterias: { ...guessWithDistinctResults.criterias, afflictions: [] }
    } as Guess;

    const wrapper = mount(GameGuessList, {
      props: {
        modelValue: [guess]
      }
    });

    expect(getFirstRowDataCells(wrapper)[4]!.text()).toContain("-");
  });
})
