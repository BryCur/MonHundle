import { mount, flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';

const { pushMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
}));

vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>();
    return { ...actual, useRouter: () => ({ push: pushMock }) };
});

import SelectGamesView from '@/views/SelectGamesView.vue';
import { LocalStorageKeys } from '@/services/LocalStorageService';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { paths } from '@/router';

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
    const resourceService = { getAllGameTitles: vi.fn().mockResolvedValue(GAMES) };
    const wrapper = mount(SelectGamesView, {
        global: { plugins: [i18n], provide: { resourceService } },
    });
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

describe('SelectGamesView when the game list cannot be loaded', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('saves an empty list (all games), leaves for the previous page and lets the error through', async () => {
        const error = new LoadFailedError('Could not load game titles', 'AllGameTitle');
        const resourceService = { getAllGameTitles: vi.fn().mockRejectedValue(error) };
        // stands in for the app's global error handler, which turns the error into a notification
        const errorHandler = vi.fn();

        const wrapper = mount(SelectGamesView, {
            global: { plugins: [i18n], provide: { resourceService }, config: { errorHandler } },
        });
        await flushPromises();

        expect(JSON.parse(localStorage.getItem(LocalStorageKeys.GAME_LIST)!)).toEqual([]);
        expect(pushMock).toHaveBeenCalledWith(paths.unlimited);
        expect(errorHandler).toHaveBeenCalledWith(error, expect.anything(), expect.any(String));
        expect(wrapper.text()).not.toContain('loading...');
    });
});
