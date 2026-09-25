import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';

const { pushMock, apiFetchMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
    apiFetchMock: vi.fn(),
}));

vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>();
    return { ...actual, useRouter: () => ({ push: pushMock }) };
});
vi.mock('@/services/ApiService/ApiBaseAccess', () => ({
    apiFetch: apiFetchMock,
}));

import SelectGamesView from '@/views/SelectGamesView.vue';
import { LocalStorageKeys } from '@/services/LocalStorageService';

const i18n = createI18n({
    legacy: false,
    globalInjection: false,
    missingWarn: false,
    fallbackWarn: false,
    locale: 'en',
    messages: { en: {} },
});

const GAMES = ['MHW', 'MHR', 'MHWilds'];

async function mountView() {
    apiFetchMock.mockResolvedValue({ json: async () => GAMES });
    const wrapper = mount(SelectGamesView, { global: { plugins: [i18n] } });
    await flushPromises();
    return wrapper;
}

describe('SelectGamesView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders one item per game title once the list is loaded', async () => {
        const wrapper = await mountView();

        expect(wrapper.findAll('.list-item').length).toBe(GAMES.length);
    });

    it("toggles an item's selected state on click", async () => {
        const wrapper = await mountView();
        const first = wrapper.findAll('.list-item')[0]!;

        expect(first.classes()).not.toContain('selected');
        await first.trigger('click');
        expect(first.classes()).toContain('selected');
        await first.trigger('click');
        expect(first.classes()).not.toContain('selected');
    });

    it('confirmSelection persists only the selected games and navigates away', async () => {
        const wrapper = await mountView();
        await wrapper.findAll('.list-item')[1]!.trigger('click'); // MHR

        await wrapper.find('button.btn-confirm').trigger('click');

        expect(JSON.parse(localStorage.getItem(LocalStorageKeys.GAME_LIST)!)).toEqual(['MHR']);
        expect(pushMock).toHaveBeenCalled();
    });

    it('confirmSelection falls back to the whole list when nothing is selected', async () => {
        const wrapper = await mountView();

        await wrapper.find('button.btn-confirm').trigger('click');

        expect(JSON.parse(localStorage.getItem(LocalStorageKeys.GAME_LIST)!)).toEqual(GAMES);
    });
});
