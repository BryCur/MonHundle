import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import MonsterSelectBox from '@/components/game-elements/MonsterSelectBox.vue';
import { nextTick } from 'vue';

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key: string) => key,
        locale: { value: 'en' },
    }),
}));

const sampleMonsterList = ['nargacuga', 'zinogre', 'chatacabra'];

describe('MonsterSelectBox', () => {
    it('should list monster of items prop', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        wrapper.find('.monster-select-toggle').trigger('click');
        await nextTick();

        const monsterOptions = wrapper.findAll('.monster-option');
        expect(monsterOptions.length).toBe(sampleMonsterList.length);
    });

    it("should translate monster's names", async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        wrapper.find('.monster-select-toggle').trigger('click');
        await nextTick();

        const monsterTranslations = wrapper.findAll('.monster-option').map((e) => e.text());
        expect(monsterTranslations).toStrictEqual(
            sampleMonsterList.map((e) => `game.monster.${e}.name`),
        );
    });

    it('should close the dropdown and show the selected label after picking an option', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        wrapper.find('.monster-select-toggle').trigger('click');
        await nextTick();

        wrapper.find('.monster-option').trigger('click');
        await nextTick();

        expect(wrapper.find('.monster-option-list').exists()).toBe(false);
        expect((wrapper.find('input.monster-search-input').element as HTMLInputElement).value).toBe(
            'game.monster.nargacuga.name',
        );
    });

    it('should output the selected monster code on option selection', async () => {
        let output: string | undefined = undefined;
        const wrapper = mount(MonsterSelectBox, {
            props: {
                items: sampleMonsterList,
                modelValue: output,
                'onUpdate:modelValue': (value: string | undefined) => {
                    output = value;
                },
            },
        });

        wrapper.find('.monster-select-toggle').trigger('click');
        await nextTick();

        wrapper.find('.monster-option').trigger('click');
        await nextTick();

        const emitted = wrapper.emitted('update:modelValue');

        expect(emitted).toBeTruthy();
        expect(emitted![0]).toEqual(['nargacuga']);
        expect(output).toBe('nargacuga');
    });

    it('should filter options when textbox gets filled', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        wrapper.find('.monster-select-toggle').trigger('click');
        await nextTick();

        wrapper.find('input.monster-search-input').setValue('zino');
        await nextTick();

        const monsterOptions = wrapper.findAll('.monster-option');
        expect(monsterOptions.length).toBe(1);
    });

    it('should filter case-insensitively', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        wrapper.find('.monster-select-toggle').trigger('click');
        await nextTick();

        wrapper.find('input.monster-search-input').setValue('ZINO');
        await nextTick();

        expect(wrapper.findAll('.monster-option').length).toBe(1);
    });

    it('should show no options when the search term matches nothing', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        wrapper.find('.monster-select-toggle').trigger('click');
        await nextTick();

        wrapper.find('input.monster-search-input').setValue('does-not-exist');
        await nextTick();

        expect(wrapper.findAll('.monster-option').length).toBe(0);
    });

    it('should open the dropdown on ArrowDown when it is closed', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'ArrowDown' });
        await nextTick();

        expect(wrapper.find('.monster-option-list').exists()).toBe(true);
    });

    it('should select the highlighted option on Enter', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'ArrowDown' }); // open, highlight -> 0
        await nextTick();
        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'Enter' });
        await nextTick();

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['nargacuga']);
    });

    it('should move the highlight forward with ArrowDown', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'ArrowDown' }); // open, highlight -> 0
        await nextTick();
        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'ArrowDown' }); // highlight -> 1
        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'Enter' });
        await nextTick();

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['zinogre']);
    });

    it('should wrap the highlight to the last option when pressing ArrowUp on the first', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'ArrowDown' }); // open, highlight -> 0
        await nextTick();
        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'ArrowUp' }); // highlight -> 2 (wrap)
        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'Enter' });
        await nextTick();

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['chatacabra']);
    });

    it('should restore the current model value on Escape', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList, modelValue: 'zinogre' },
        });

        wrapper.find('.monster-select-toggle').trigger('click');
        await nextTick();

        wrapper.find('input.monster-search-input').setValue('narg');
        await wrapper.find('input.monster-search-input').trigger('keydown', { key: 'Escape' });
        await nextTick();

        expect(wrapper.find('.monster-option-list').exists()).toBe(false);
        expect((wrapper.find('input.monster-search-input').element as HTMLInputElement).value).toBe(
            'game.monster.zinogre.name',
        );
    });

    it('sorts filtered options in descending label order', async () => {
        const wrapper = mount(MonsterSelectBox, {
            props: { items: sampleMonsterList },
        });

        wrapper.find('.monster-select-toggle').trigger('click');
        await nextTick();

        wrapper.find('input.monster-search-input').setValue('game.monster');
        await nextTick();

        const labels = wrapper.findAll('.monster-option').map((o) => o.text());
        expect(labels).toEqual([
            'game.monster.chatacabra.name',
            'game.monster.nargacuga.name',
            'game.monster.zinogre.name',
        ]);
    });
});
