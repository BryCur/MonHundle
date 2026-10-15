import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import SettingView from '@/views/SettingView.vue';
import { LocalStorageKeys } from '@/services/LocalStorageService';
import { notificationEmitterKey } from '@/injectionKeyRegistry';
import { NotificationTypes } from '@/domain/Notification';

// real (empty) i18n so `t()` resolves to the key path
const i18n = createI18n({
    legacy: false,
    globalInjection: false,
    missingWarn: false,
    fallbackWarn: false,
    locale: 'en',
    messages: { en: {} },
});

async function mountView() {
    const wrapper = mount(SettingView, {
        global: { plugins: [i18n], provide: { settingsApi: {} } },
    });
    await flushPromises(); // onMounted fills gameList from localStorage, then the label re-renders
    return wrapper;
}

describe('SettingView game-list label', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('uses the short label when fewer than 4 games are selected', async () => {
        localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(['MHW', 'MHR']));

        const text = (await mountView()).text();

        expect(text).toContain('ui.settings.gameList.shortLabel');
        expect(text).not.toContain('ui.settings.gameList.label');
    });

    it('uses the truncated label (with the total count) when 4+ games are selected', async () => {
        localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(['A', 'B', 'C', 'D', 'E']));

        expect((await mountView()).text()).toContain('ui.settings.gameList.label');
    });

    it('treats a missing stored game list as an empty one', async () => {
        // nothing stored under GAME_LIST: JSON.parse(null) yields null, not an array
        const errorHandler = vi.fn();

        const wrapper = mount(SettingView, {
            global: { plugins: [i18n], provide: { settingsApi: {} }, config: { errorHandler } },
        });
        await flushPromises();

        expect(errorHandler).not.toHaveBeenCalled();
        expect(wrapper.text()).toContain('ui.settings.gameList.shortLabel');
    });
});

describe('SettingView actions', () => {
    const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
    const RELOAD_DELAY_MS = 1500;

    let notify: ReturnType<typeof vi.fn>;
    let errorHandler: ReturnType<typeof vi.fn>;
    let reload: ReturnType<typeof vi.fn>;
    let writeText: ReturnType<typeof vi.fn>;
    let settingsApi: {
        validateUser: ReturnType<typeof vi.fn>;
        loadUser: ReturnType<typeof vi.fn>;
        getProfile: ReturnType<typeof vi.fn>;
        saveSettings: ReturnType<typeof vi.fn>;
    };

    async function mountWithMocks() {
        const wrapper = mount(SettingView, {
            global: {
                plugins: [i18n],
                provide: { settingsApi, [notificationEmitterKey]: { notify } },
                // stands in for the app's global error handler
                config: { errorHandler },
            },
        });
        await flushPromises();
        return wrapper;
    }

    // with the empty i18n, a button's text is its translation key
    function button(wrapper: VueWrapper, labelKey: string) {
        return wrapper.findAll('button').find((b) => b.text() === labelKey)!;
    }

    function allButtonsDisabled(wrapper: VueWrapper) {
        return wrapper.findAll('button').every((b) => b.attributes('disabled') !== undefined);
    }

    function noButtonDisabled(wrapper: VueWrapper) {
        return wrapper.findAll('button').every((b) => b.attributes('disabled') === undefined);
    }

    async function loadProfile(wrapper: VueWrapper, uuid: string) {
        await wrapper.find('input:not([type="checkbox"])').setValue(uuid);
        await button(wrapper, 'ui.settings.setUUID.button').trigger('click');
        await flushPromises();
    }

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(['MHW']));

        // only the timeouts: flushPromises relies on the real setImmediate
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

        notify = vi.fn();
        errorHandler = vi.fn();
        reload = vi.fn();
        // jsdom refuses to redefine location.reload, but the whole location can be stubbed
        vi.stubGlobal('location', { ...window.location, reload });
        writeText = vi.fn().mockResolvedValue(undefined);
        // jsdom has no clipboard API
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            configurable: true,
        });

        settingsApi = {
            validateUser: vi.fn().mockResolvedValue(true),
            loadUser: vi.fn().mockResolvedValue(undefined),
            getProfile: vi.fn().mockResolvedValue({
                gameList: ['MHR'],
                enableTableVisualAid: false,
                currentDailyGameUuid: null,
                currentUnlimitedGameUuid: null,
            }),
            saveSettings: vi.fn().mockResolvedValue(undefined),
        };
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        Reflect.deleteProperty(navigator, 'clipboard');
    });

    describe('copying the UUID', () => {
        it('notifies once the UUID is in the clipboard', async () => {
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.settings.copyUUID.button').trigger('click');
            await flushPromises();

            expect(writeText).toHaveBeenCalled();
            expect(notify).toHaveBeenCalledWith({
                type: NotificationTypes.Info,
                messageKey: 'ui.notification.info.uuidCopied.message',
            });
        });

        it('does not notify a success when the clipboard refuses the copy', async () => {
            const error = new Error('clipboard denied');
            writeText.mockRejectedValue(error);
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.settings.copyUUID.button').trigger('click');
            await flushPromises();

            expect(notify).not.toHaveBeenCalled();
            expect(errorHandler).toHaveBeenCalledWith(error, expect.anything(), expect.any(String));
        });
    });

    describe('saving the preferences', () => {
        it('disables the buttons while saving, then notifies the success', async () => {
            let finishSaving!: () => void;
            settingsApi.saveSettings.mockReturnValue(
                new Promise<void>((resolve) => (finishSaving = resolve)),
            );
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.settings.savePreferences.button').trigger('click');
            expect(allButtonsDisabled(wrapper)).toBe(true);
            expect(notify).not.toHaveBeenCalled();

            finishSaving();
            await flushPromises();

            expect(noButtonDisabled(wrapper)).toBe(true);
            expect(notify).toHaveBeenCalledWith({
                type: NotificationTypes.Success,
                messageKey: 'ui.notification.success.savedSettings.message',
            });
        });

        it('enables the buttons again when saving fails', async () => {
            const error = new Error('network down');
            settingsApi.saveSettings.mockRejectedValue(error);
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.settings.savePreferences.button').trigger('click');
            await flushPromises();

            expect(noButtonDisabled(wrapper)).toBe(true);
            expect(notify).not.toHaveBeenCalled();
            expect(errorHandler).toHaveBeenCalledWith(error, expect.anything(), expect.any(String));
        });
    });

    describe('loading a profile', () => {
        it('notifies the success and reloads the page after a delay, buttons kept disabled', async () => {
            const wrapper = await mountWithMocks();

            await loadProfile(wrapper, VALID_UUID);

            expect(notify).toHaveBeenCalledWith({
                type: NotificationTypes.Success,
                messageKey: 'ui.notification.success.profileLoaded.message',
            });
            expect(allButtonsDisabled(wrapper)).toBe(true);

            vi.advanceTimersByTime(RELOAD_DELAY_MS - 1);
            expect(reload).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(reload).toHaveBeenCalledTimes(1);
        });

        it('enables the buttons again for an unknown UUID, without notifying nor reloading', async () => {
            settingsApi.validateUser.mockResolvedValue(false);
            const wrapper = await mountWithMocks();

            await loadProfile(wrapper, VALID_UUID);
            vi.advanceTimersByTime(RELOAD_DELAY_MS);

            expect(noButtonDisabled(wrapper)).toBe(true);
            expect(notify).not.toHaveBeenCalled();
            expect(reload).not.toHaveBeenCalled();
        });

        it('enables the buttons again for a malformed UUID, without calling the api', async () => {
            const wrapper = await mountWithMocks();

            await loadProfile(wrapper, 'not-a-uuid');
            vi.advanceTimersByTime(RELOAD_DELAY_MS);

            expect(settingsApi.validateUser).not.toHaveBeenCalled();
            expect(noButtonDisabled(wrapper)).toBe(true);
            expect(notify).not.toHaveBeenCalled();
            expect(reload).not.toHaveBeenCalled();
        });

        it('enables the buttons again and lets the error through when the api fails', async () => {
            const error = new Error('network down');
            settingsApi.validateUser.mockRejectedValue(error);
            const wrapper = await mountWithMocks();

            await loadProfile(wrapper, VALID_UUID);
            vi.advanceTimersByTime(RELOAD_DELAY_MS);

            expect(noButtonDisabled(wrapper)).toBe(true);
            expect(notify).not.toHaveBeenCalled();
            expect(reload).not.toHaveBeenCalled();
            expect(errorHandler).toHaveBeenCalledWith(error, expect.anything(), expect.any(String));
        });
    });

    describe('deleting the stored data', () => {
        it('clears the storage, notifies and reloads after a delay, buttons kept disabled', async () => {
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.settings.deleteUUID.button').trigger('click');

            expect(localStorage.length).toBe(0);
            expect(notify).toHaveBeenCalledWith({
                type: NotificationTypes.Success,
                messageKey: 'ui.notification.success.dataDeleted.message',
            });
            expect(allButtonsDisabled(wrapper)).toBe(true);

            vi.advanceTimersByTime(RELOAD_DELAY_MS - 1);
            expect(reload).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(reload).toHaveBeenCalledTimes(1);
        });
    });
});
