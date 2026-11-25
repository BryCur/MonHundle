import { vi } from 'vitest';
import { defineComponent, h } from 'vue';

/**
 * Stands in for MonsterSelectBox in the game views: same contract (v-model, `submit` event,
 * exposed `focus()`), without the dropdown. A new stub per mount, so that each test gets its own
 * `focus` spy.
 */
export function createMonsterSelectBoxStub() {
    const focus = vi.fn();

    const stub = defineComponent({
        name: 'MonsterSelectBox',
        props: {
            items: { type: Array, default: () => [] },
            modelValue: { type: String, default: undefined },
        },
        emits: ['update:modelValue', 'submit'],
        setup(_props, { expose }) {
            expose({ focus });
            return () => h('div', { class: 'monster-select-box-stub' });
        },
    });

    return { stub, focus };
}
