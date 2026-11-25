import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MonsterSelectBox from '@/components/game-elements/MonsterSelectBox.vue';
import { nextTick } from 'vue';

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key: string) => key,
        locale: { value: 'en' },
    }),
}));

const sampleMonsterList = ['nargacuga', 'zinogre', 'chatacabra'];

// jsdom does not implement scrollIntoView, called by the component to keep the highlighted option visible
const scrollIntoViewMock = vi.fn();

beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoViewMock;
});

afterEach(() => {
    scrollIntoViewMock.mockReset();
    // @ts-expect-error restores jsdom's original state, where the method does not exist
    delete Element.prototype.scrollIntoView;
});

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
        expect(monsterTranslations).toStrictEqual([
            'game.monster.chatacabra.name',
            'game.monster.nargacuga.name',
            'game.monster.zinogre.name',
        ]);
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
            'game.monster.chatacabra.name',
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
        expect(emitted![0]).toEqual(['chatacabra']);
        expect(output).toBe('chatacabra');
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

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['chatacabra']);
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

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['nargacuga']);
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

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['zinogre']);
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

    it('should keep the alphabetical order when filtering', async () => {
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

    describe('highlight', () => {
        function getSearchInput(wrapper: VueWrapper) {
            return wrapper.find('input.monster-search-input');
        }

        function getHighlightedLabels(wrapper: VueWrapper): string[] {
            return wrapper.findAll('.monster-option.is-highlighted').map((o) => o.text());
        }

        it('should highlight the first option when the dropdown opens without a selection', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
            await flushPromises();

            expect(getHighlightedLabels(wrapper)).toEqual(['game.monster.chatacabra.name']);
        });

        it('should move the highlight class along with the arrow keys', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // open, highlight -> 0
            await flushPromises();
            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // highlight -> 1

            expect(getHighlightedLabels(wrapper)).toEqual(['game.monster.nargacuga.name']);
        });

        it('should mark only the currently selected monster as selected', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList, modelValue: 'zinogre' },
            });

            await wrapper.find('.monster-select-toggle').trigger('click');
            await flushPromises();
            await getSearchInput(wrapper).setValue('game.monster'); // matches every monster

            const selectedLabels = wrapper
                .findAll('.monster-option.is-selected')
                .map((o) => o.text());
            expect(selectedLabels).toEqual(['game.monster.zinogre.name']);
        });

        it('should reset the highlight to the first result when typing', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // open, highlight -> 0
            await flushPromises();
            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // highlight -> 1
            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // highlight -> 2

            await getSearchInput(wrapper).setValue('game.monster'); // sorted: chatacabra, nargacuga, zinogre

            expect(getHighlightedLabels(wrapper)).toEqual(['game.monster.chatacabra.name']);

            await getSearchInput(wrapper).trigger('keydown', { key: 'Enter' });
            expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['chatacabra']);
        });

        it('should highlight nothing, and select nothing on Enter, when the search matches nothing', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
            await flushPromises();
            await getSearchInput(wrapper).setValue('does-not-exist');
            await getSearchInput(wrapper).trigger('keydown', { key: 'Enter' });

            expect(getHighlightedLabels(wrapper)).toEqual([]);
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        });

        it('should move the highlight to the option under the mouse', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // open, highlight -> 0
            await flushPromises();
            await wrapper.findAll('.monster-option')[2]!.trigger('mousemove');

            expect(getHighlightedLabels(wrapper)).toEqual(['game.monster.zinogre.name']);

            await getSearchInput(wrapper).trigger('keydown', { key: 'Enter' });
            expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['zinogre']);
        });

        it('should scroll the highlighted option into view', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // open, highlight -> 0
            await flushPromises();
            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // highlight -> 1
            await flushPromises();

            const options = wrapper.findAll('.monster-option');
            expect(scrollIntoViewMock.mock.contexts).toEqual([
                options[0]!.element,
                options[1]!.element,
            ]);
            expect(scrollIntoViewMock).toHaveBeenLastCalledWith({ block: 'nearest' });
        });
    });

    describe('opening and closing', () => {
        function getSearchInput(wrapper: VueWrapper) {
            return wrapper.find('input.monster-search-input');
        }

        function getSearchValue(wrapper: VueWrapper): string {
            return (getSearchInput(wrapper).element as HTMLInputElement).value;
        }

        function isListOpen(wrapper: VueWrapper): boolean {
            return wrapper.find('.monster-option-list').exists();
        }

        // mimics a parent bound with v-model: the prop only changes once the parent sends it back
        function mountWithVModel(modelValue?: string) {
            const wrapper: VueWrapper = mount(MonsterSelectBox, {
                props: {
                    items: sampleMonsterList,
                    modelValue,
                    'onUpdate:modelValue': (value: string | undefined) =>
                        wrapper.setProps({ modelValue: value }),
                },
            });
            return wrapper;
        }

        it('should empty the search and list every monster when opening with a selection', async () => {
            const wrapper = mountWithVModel('zinogre');

            await wrapper.find('.monster-select-toggle').trigger('click');
            await flushPromises();

            expect(getSearchValue(wrapper)).toBe('');
            expect(wrapper.findAll('.monster-option').length).toBe(sampleMonsterList.length);
        });

        it('should highlight the selected monster and scroll to it when opening', async () => {
            const wrapper = mountWithVModel('zinogre');

            await wrapper.find('.monster-select-toggle').trigger('click');
            await flushPromises();

            const highlighted = wrapper.find('.monster-option.is-highlighted');
            expect(highlighted.text()).toBe('game.monster.zinogre.name');
            expect(scrollIntoViewMock.mock.contexts.at(-1)).toBe(highlighted.element);
        });

        it('should show the selected monster as placeholder, or the default text without selection', () => {
            const withSelection = mountWithVModel('zinogre');
            const withoutSelection = mountWithVModel();

            expect(getSearchInput(withSelection).attributes('placeholder')).toBe(
                'game.monster.zinogre.name',
            );
            expect(getSearchInput(withoutSelection).attributes('placeholder')).toBe(
                'ui.placeholder.monsterSelector',
            );
        });

        it('should show the label of the picked monster with a v-model bound parent', async () => {
            const wrapper = mountWithVModel('zinogre');

            await wrapper.find('.monster-select-toggle').trigger('click');
            await flushPromises();
            await wrapper.findAll('.monster-option')[0]!.trigger('click');
            await flushPromises();

            expect(wrapper.emitted('update:modelValue')).toEqual([['chatacabra']]);
            expect(isListOpen(wrapper)).toBe(false);
            expect(getSearchValue(wrapper)).toBe('game.monster.chatacabra.name');
        });

        it('should clear the typed search and close on Escape when nothing is selected', async () => {
            const wrapper = mountWithVModel();

            await wrapper.find('.monster-select-toggle').trigger('click');
            await flushPromises();
            await getSearchInput(wrapper).setValue('zino');
            await getSearchInput(wrapper).trigger('keydown', { key: 'Escape' });

            expect(isListOpen(wrapper)).toBe(false);
            expect(getSearchValue(wrapper)).toBe('');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        });

        it('should restore the previous selection when the focus leaves the component', async () => {
            const wrapper = mountWithVModel('zinogre');

            await wrapper.find('.monster-select-toggle').trigger('click');
            await flushPromises();
            await getSearchInput(wrapper).setValue('narg');
            // click on a non-focusable area: the focus goes nowhere
            await getSearchInput(wrapper).trigger('focusout', { relatedTarget: null });

            expect(isListOpen(wrapper)).toBe(false);
            expect(getSearchValue(wrapper)).toBe('game.monster.zinogre.name');
            expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        });

        it('should clear the typed search when the focus leaves the component without selection', async () => {
            const wrapper = mountWithVModel();

            await wrapper.find('.monster-select-toggle').trigger('click');
            await flushPromises();
            await getSearchInput(wrapper).setValue('zino');
            // Tab: the focus goes to the next focusable element of the page
            await getSearchInput(wrapper).trigger('focusout', {
                relatedTarget: document.createElement('button'),
            });

            expect(isListOpen(wrapper)).toBe(false);
            expect(getSearchValue(wrapper)).toBe('');
        });

        it('should stay open when the focus moves inside the component', async () => {
            const wrapper = mountWithVModel();

            await wrapper.find('.monster-select-toggle').trigger('click');
            await flushPromises();
            await getSearchInput(wrapper).trigger('focusout', {
                relatedTarget: wrapper.find('.monster-option-list').element,
            });

            expect(isListOpen(wrapper)).toBe(true);
        });

        it('should keep the focus in the field when pressing an option or the toggle', async () => {
            const wrapper = mountWithVModel();

            await wrapper.find('.monster-select-toggle').trigger('click');
            await flushPromises();

            const pressedElements = [
                wrapper.find('.monster-select-toggle').element,
                wrapper.find('.monster-option').element,
            ];
            for (const element of pressedElements) {
                // dispatchEvent returns false when a listener called preventDefault
                const notPrevented = element.dispatchEvent(
                    new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
                );
                expect(notPrevented).toBe(false);
            }
        });

        it('should reopen the list on the typed search when editing a selection', async () => {
            const wrapper = mountWithVModel('zinogre');

            // closed, the field shows the selection: the player edits it without reopening first
            await getSearchInput(wrapper).setValue('narg');

            expect(isListOpen(wrapper)).toBe(true);
            expect(wrapper.findAll('.monster-option.is-highlighted').map((o) => o.text())).toEqual([
                'game.monster.nargacuga.name',
            ]);
        });

        it('should not open the list when the field only gets the focus', async () => {
            const wrapper = mountWithVModel('zinogre');

            // e.g. Tab, or the focus given back by the game view after a guess
            await getSearchInput(wrapper).trigger('focus');
            await flushPromises();

            expect(isListOpen(wrapper)).toBe(false);
            expect(getSearchValue(wrapper)).toBe('game.monster.zinogre.name');
        });

        it('should open the list and empty the search when clicking the field with a selection', async () => {
            const wrapper = mountWithVModel('zinogre');

            await getSearchInput(wrapper).trigger('click');
            await flushPromises();

            expect(isListOpen(wrapper)).toBe(true);
            expect(getSearchValue(wrapper)).toBe('');
        });

        it('should keep the typed search when clicking the field while the list is open', async () => {
            const wrapper = mountWithVModel('zinogre');

            await getSearchInput(wrapper).trigger('click');
            await flushPromises();
            await getSearchInput(wrapper).setValue('narg');
            // e.g. to move the caret within the typed text
            await getSearchInput(wrapper).trigger('click');
            await flushPromises();

            expect(isListOpen(wrapper)).toBe(true);
            expect(getSearchValue(wrapper)).toBe('narg');
        });

        it('should open the list and empty the search on ArrowDown with a selection', async () => {
            const wrapper = mountWithVModel('zinogre');

            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
            await flushPromises();

            expect(isListOpen(wrapper)).toBe(true);
            expect(getSearchValue(wrapper)).toBe('');
        });
    });

    describe('sorting and empty result', () => {
        function getLabels(wrapper: VueWrapper): string[] {
            return wrapper.findAll('.monster-option').map((o) => o.text());
        }

        it('should sort the options alphabetically even without search', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await wrapper.find('.monster-select-toggle').trigger('click');

            expect(getLabels(wrapper)).toEqual([
                'game.monster.chatacabra.name',
                'game.monster.nargacuga.name',
                'game.monster.zinogre.name',
            ]);
        });

        it('should sort accented names with their base letter', async () => {
            // artificial code: the mocked t() returns the key, so the accent ends up in the label
            const wrapper = mount(MonsterSelectBox, {
                props: { items: ['zinogre', 'éclat', 'rathalos'] },
            });

            await wrapper.find('.monster-select-toggle').trigger('click');

            // a raw `>` comparison would put 'é' after 'z'
            expect(getLabels(wrapper)).toEqual([
                'game.monster.éclat.name',
                'game.monster.rathalos.name',
                'game.monster.zinogre.name',
            ]);
        });

        it('should not sort the items prop of the parent in place', async () => {
            const items = [...sampleMonsterList];
            const wrapper = mount(MonsterSelectBox, { props: { items } });

            await wrapper.find('.monster-select-toggle').trigger('click');

            expect(items).toEqual(sampleMonsterList);
        });

        it('should ignore the spaces around the search term', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await wrapper.find('.monster-select-toggle').trigger('click');
            await wrapper.find('input.monster-search-input').setValue('  zino ');

            expect(getLabels(wrapper)).toEqual(['game.monster.zinogre.name']);
        });

        it('should show a message when the search matches nothing', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await wrapper.find('.monster-select-toggle').trigger('click');
            expect(wrapper.find('.monster-select-empty').exists()).toBe(false);

            await wrapper.find('input.monster-search-input').setValue('does-not-exist');

            expect(wrapper.find('.monster-select-empty').text()).toBe(
                'ui.page.game.search.notFound',
            );
        });
    });

    describe('submit and focus', () => {
        function getSearchInput(wrapper: VueWrapper) {
            return wrapper.find('input.monster-search-input');
        }

        it('should ask to submit on Enter when the list is closed and a monster is selected', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList, modelValue: 'zinogre' },
            });

            await getSearchInput(wrapper).trigger('keydown', { key: 'Enter' });

            expect(wrapper.emitted('submit')).toHaveLength(1);
            expect(wrapper.find('.monster-option-list').exists()).toBe(false);
        });

        it('should open the list on Enter when the list is closed and nothing is selected', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList },
            });

            await getSearchInput(wrapper).trigger('keydown', { key: 'Enter' });

            expect(wrapper.emitted('submit')).toBeUndefined();
            expect(wrapper.find('.monster-option-list').exists()).toBe(true);
        });

        it('should only select the highlighted option on Enter when the list is open', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList, modelValue: 'zinogre' },
            });

            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // open on zinogre (last)
            await flushPromises();
            await getSearchInput(wrapper).trigger('keydown', { key: 'ArrowDown' }); // wrap to chatacabra
            await getSearchInput(wrapper).trigger('keydown', { key: 'Enter' });

            expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['chatacabra']);
            expect(wrapper.emitted('submit')).toBeUndefined();
        });

        it('should expose a focus() that gives the focus to the field without opening the list', async () => {
            const wrapper = mount(MonsterSelectBox, {
                props: { items: sampleMonsterList, modelValue: 'zinogre' },
                attachTo: document.body, // focus only works on an element of the document
            });

            (wrapper.vm as unknown as { focus: () => void }).focus();
            await flushPromises();

            expect(document.activeElement).toBe(getSearchInput(wrapper).element);
            expect(wrapper.find('.monster-option-list').exists()).toBe(false);
            wrapper.unmount();
        });
    });
});
