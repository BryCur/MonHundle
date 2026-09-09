import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import MonsterSelectBox from "@/components/game-elements/MonsterSelectBox.vue"
import { nextTick } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: "en" }
  })
}));

const sampleMonsterList = ["nargacuga", "zinogre", "chatacabra"];

describe("MonsterSelectBox", () => {
    it("should list monster of items prop", async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: {items: sampleMonsterList}
        });

        wrapper.find(".monster-select-toggle").trigger("click");
        await nextTick();

        const monsterOptions = wrapper.findAll(".monster-option");
        expect(monsterOptions.length).toBe(sampleMonsterList.length);
    });

    it("should translate monster's names", async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: {items: sampleMonsterList}
        });

        wrapper.find(".monster-select-toggle").trigger("click");
        await nextTick();

        const monsterTranslations = wrapper.findAll(".monster-option").map(e => e.text());
        expect(monsterTranslations).toStrictEqual(sampleMonsterList.map(e => `game.monster.${e}.name`));
    });

    it("should close the dropdown and show the selected label after picking an option", async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: {items: sampleMonsterList}
        });

        wrapper.find(".monster-select-toggle").trigger("click");
        await nextTick();

        wrapper.find(".monster-option").trigger("click");
        await nextTick();

        expect(wrapper.find(".monster-option-list").exists()).toBe(false);
        expect((wrapper.find("input.monster-search-input").element as HTMLInputElement).value)
            .toBe("game.monster.nargacuga.name");
    });

    it("should output the selected monster code on option selection", async () => {
        let output: string | undefined = undefined;
        const wrapper = mount(MonsterSelectBox, {
            props: {
                items: sampleMonsterList,
                modelValue: output,
                "onUpdate:modelValue": (value: string | undefined) => {
                    output = value;
                }
            },
        });

        wrapper.find(".monster-select-toggle").trigger("click");
        await nextTick();

        wrapper.find(".monster-option").trigger("click");
        await nextTick();

        const emitted = wrapper.emitted("update:modelValue");

        expect(emitted).toBeTruthy();
        expect(emitted![0]).toEqual(["nargacuga"]);
        expect(output).toBe("nargacuga");
    });

    it("should filter options when textbox gets filled", async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: {items: sampleMonsterList}
        });

        wrapper.find(".monster-select-toggle").trigger("click");
        await nextTick();

        wrapper.find("input.monster-search-input").setValue("zino");
        await nextTick();

        const monsterOptions = wrapper.findAll(".monster-option");
        expect(monsterOptions.length).toBe(1);
    });
});