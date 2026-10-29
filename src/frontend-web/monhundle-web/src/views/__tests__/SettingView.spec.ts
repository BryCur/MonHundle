import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';

const { pushMock, replaceMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
    replaceMock: vi.fn(),
}));

// the view gets its router through useRouter(); no real router is installed in these tests
vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>();
    return { ...actual, useRouter: () => ({ push: pushMock, replace: replaceMock }) };
});

import SettingView from '@/views/SettingView.vue';
import { LocalStorageKeys } from '@/services/LocalStorageService';
import { notificationEmitterKey, settingsApiKey } from '@/injectionKeyRegistry';
import { NotificationTypes } from '@/domain/Notification';
import { BackendUnavailableError } from '@/domain/errors/BlockingError/BackendUnavailableError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';
import { paths } from '@/router';

// real (empty) i18n so `t()` resolves to the key path
// the page is only shown to an identified player
const STORED_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

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
        global: {
            plugins: [i18n],
            provide: { [settingsApiKey]: {}, [notificationEmitterKey]: {} },
        },
    });
    await flushPromises(); // onMounted fills gameList from localStorage, then the label re-renders
    return wrapper;
}

describe('SettingView game-list label', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem(LocalStorageKeys.USER_ID, STORED_USER_ID);
    });

    it('uses the short label when fewer than 4 games are selected', async () => {
        localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(['MHW', 'MHR']));

        const text = (await mountView()).text();

        expect(text).toContain('ui.page.settings.gameList.shortLabel');
        expect(text).not.toContain('ui.page.settings.gameList.label');
    });

    it('uses the truncated label (with the total count) when 4+ games are selected', async () => {
        localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(['A', 'B', 'C', 'D', 'E']));

        expect((await mountView()).text()).toContain('ui.page.settings.gameList.label');
    });

    it('treats a missing stored game list as an empty one', async () => {
        // nothing stored under GAME_LIST: JSON.parse(null) yields null, not an array
        const errorHandler = vi.fn();

        const wrapper = mount(SettingView, {
            global: {
                plugins: [i18n],
                provide: { [settingsApiKey]: {}, [notificationEmitterKey]: {} },
                config: { errorHandler },
            },
        });
        await flushPromises();

        expect(errorHandler).not.toHaveBeenCalled();
        expect(wrapper.text()).toContain('ui.page.settings.gameList.shortLabel');
    });

    it.each([
        ['is not valid JSON', '{not json'],
        ['is not an array', '42'],
    ])(
        'falls back to an empty list when the stored game list %s, and still loads the other settings',
        async (_label, storedValue) => {
            localStorage.setItem(LocalStorageKeys.GAME_LIST, storedValue);
            localStorage.setItem(LocalStorageKeys.TABLE_VISUAL_ACCESSIBILITY, 'true');
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const errorHandler = vi.fn();

            const wrapper = mount(SettingView, {
                global: {
                    plugins: [i18n],
                    provide: { [settingsApiKey]: {}, [notificationEmitterKey]: {} },
                    config: { errorHandler },
                },
            });
            await flushPromises();

            expect(errorHandler).not.toHaveBeenCalled();
            expect(wrapper.text()).toContain('ui.page.settings.gameList.shortLabel');
            // the rest of the mounted hook still ran
            const a11yCheckbox = wrapper.find('input[type="checkbox"]').element as HTMLInputElement;
            expect(a11yCheckbox.checked).toBe(true);

            warn.mockRestore();
        },
    );
});

describe('SettingView actions', () => {
    const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
    const RELOAD_DELAY_MS = 1500;

    let notify: ReturnType<typeof vi.fn>;
    let errorHandler: ReturnType<typeof vi.fn>;
    let reload: ReturnType<typeof vi.fn>;
    let writeText: ReturnType<typeof vi.fn>;
    let settingsApi: {
        loadUser: ReturnType<typeof vi.fn>;
        getProfile: ReturnType<typeof vi.fn>;
        saveSettings: ReturnType<typeof vi.fn>;
    };

    async function mountWithMocks() {
        const wrapper = mount(SettingView, {
            global: {
                plugins: [i18n],
                provide: { [settingsApiKey]: settingsApi, [notificationEmitterKey]: { notify } },
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

    function uuidInput(wrapper: VueWrapper) {
        return wrapper.find('input:not([type="checkbox"])');
    }

    async function loadProfile(wrapper: VueWrapper, uuid: string) {
        await uuidInput(wrapper).setValue(uuid);
        await button(wrapper, 'ui.page.settings.setUUID.button').trigger('click');
        await flushPromises();
    }

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(['MHW']));
        localStorage.setItem(LocalStorageKeys.USER_ID, STORED_USER_ID);

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
            loadUser: vi.fn().mockResolvedValue(undefined),
            getProfile: vi.fn().mockResolvedValue({
                gameList: ['MHR'],
                enableTableVisualAid: true,
                currentDailyGameUuid: null,
                currentUnlimitedGameUuid: null,
            }),
            saveSettings: vi.fn().mockResolvedValue(undefined),
        };

        // the failure paths log a warning on purpose
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        Reflect.deleteProperty(navigator, 'clipboard');
    });

    describe('changing the game list', () => {
        it('navigates to the game selection screen', async () => {
            pushMock.mockClear();
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.page.settings.gameList.button').trigger('click');

            expect(pushMock).toHaveBeenCalledExactlyOnceWith(paths.selectGame);
        });
    });

    describe('copying the UUID', () => {
        it('notifies once the UUID is in the clipboard', async () => {
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.page.settings.copyUUID.button').trigger('click');
            await flushPromises();

            expect(writeText).toHaveBeenCalledExactlyOnceWith(STORED_USER_ID);
            expect(notify).toHaveBeenCalledWith({
                type: NotificationTypes.Info,
                messageKey: 'ui.notification.info.uuidCopied.message',
            });
        });

        it('tells the player when the clipboard refuses the copy, without a success message', async () => {
            writeText.mockRejectedValue(
                new DOMException('Write permission denied', 'NotAllowedError'),
            );
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.page.settings.copyUUID.button').trigger('click');
            await flushPromises();

            expect(notify).toHaveBeenCalledExactlyOnceWith({
                type: NotificationTypes.Error,
                messageKey: 'ui.notification.error.uuidCopyFailed.message',
            });
            expect(errorHandler).not.toHaveBeenCalled();
        });
    });

    describe('saving the preferences', () => {
        it('disables the buttons while saving, then notifies the success', async () => {
            let finishSaving!: () => void;
            settingsApi.saveSettings.mockReturnValue(
                new Promise<void>((resolve) => (finishSaving = resolve)),
            );
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.page.settings.savePreferences.button').trigger('click');
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

        it('notifies the failure and enables the buttons again when the server refuses the save', async () => {
            settingsApi.saveSettings.mockRejectedValue(new UnexpectedApiError('boom', 500));
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.page.settings.savePreferences.button').trigger('click');
            await flushPromises();

            expect(noButtonDisabled(wrapper)).toBe(true);
            expect(notify).toHaveBeenCalledExactlyOnceWith({
                type: NotificationTypes.Error,
                messageKey: 'ui.notification.error.saveSettingsFailed.message',
            });
            expect(errorHandler).not.toHaveBeenCalled();
        });

        it('lets a blocking error through (to the error page) without notifying', async () => {
            const unavailable = new BackendUnavailableError('Service unreachable');
            settingsApi.saveSettings.mockRejectedValue(unavailable);
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.page.settings.savePreferences.button').trigger('click');
            await flushPromises();

            expect(noButtonDisabled(wrapper)).toBe(true);
            expect(notify).not.toHaveBeenCalled();
            expect(errorHandler).toHaveBeenCalledWith(
                unavailable,
                expect.anything(),
                expect.any(String),
            );
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

        it('fetches the profile before switching identity, then applies it locally', async () => {
            const wrapper = await mountWithMocks();

            await loadProfile(wrapper, VALID_UUID);

            expect(settingsApi.getProfile).toHaveBeenCalledWith(VALID_UUID);
            expect(settingsApi.loadUser).toHaveBeenCalledWith(VALID_UUID);
            expect(settingsApi.getProfile.mock.invocationCallOrder[0]).toBeLessThan(
                settingsApi.loadUser.mock.invocationCallOrder[0]!,
            );
            expect(localStorage.getItem(LocalStorageKeys.GAME_LIST)).toBe(JSON.stringify(['MHR']));
            expect(localStorage.getItem(LocalStorageKeys.TABLE_VISUAL_ACCESSIBILITY)).toBe('true');
        });

        it('ignores the spaces around a pasted UUID', async () => {
            const wrapper = await mountWithMocks();

            await loadProfile(wrapper, `  ${VALID_UUID} `);

            expect(settingsApi.getProfile).toHaveBeenCalledWith(VALID_UUID);
            expect(wrapper.find('.field-error').exists()).toBe(false);
        });

        it('warns about an unknown UUID without switching identity nor reloading', async () => {
            settingsApi.getProfile.mockResolvedValue(null);
            const wrapper = await mountWithMocks();

            await loadProfile(wrapper, VALID_UUID);
            vi.advanceTimersByTime(RELOAD_DELAY_MS);

            expect(settingsApi.loadUser).not.toHaveBeenCalled();
            expect(noButtonDisabled(wrapper)).toBe(true);
            expect(notify).toHaveBeenCalledExactlyOnceWith({
                type: NotificationTypes.Warning,
                messageKey: 'ui.notification.warning.profileNotFound.message',
            });
            expect(reload).not.toHaveBeenCalled();
            expect(localStorage.getItem(LocalStorageKeys.GAME_LIST)).toBe(JSON.stringify(['MHW']));
        });

        it('shows an error under the field for a malformed UUID, without calling the api', async () => {
            const wrapper = await mountWithMocks();

            await loadProfile(wrapper, 'not-a-uuid');
            vi.advanceTimersByTime(RELOAD_DELAY_MS);

            const fieldError = wrapper.find('.field-error');
            expect(fieldError.exists()).toBe(true);
            expect(fieldError.text()).toBe('ui.page.settings.setUUID.error.format');
            expect(fieldError.attributes('role')).toBe('alert');
            expect(uuidInput(wrapper).attributes('aria-invalid')).toBe('true');
            expect(uuidInput(wrapper).classes()).toContain('invalid');

            expect(settingsApi.getProfile).not.toHaveBeenCalled();
            expect(noButtonDisabled(wrapper)).toBe(true);
            expect(notify).not.toHaveBeenCalled();
            expect(reload).not.toHaveBeenCalled();
        });

        it('treats an empty field as a malformed UUID', async () => {
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.page.settings.setUUID.button').trigger('click');
            await flushPromises();

            expect(wrapper.find('.field-error').exists()).toBe(true);
            expect(settingsApi.getProfile).not.toHaveBeenCalled();
        });

        it('clears the field error as soon as the player edits the UUID', async () => {
            const wrapper = await mountWithMocks();
            await loadProfile(wrapper, 'not-a-uuid');

            await uuidInput(wrapper).setValue('not-a-uuid-either');

            expect(wrapper.find('.field-error').exists()).toBe(false);
            expect(uuidInput(wrapper).attributes('aria-invalid')).toBe('false');
            expect(uuidInput(wrapper).classes()).not.toContain('invalid');
        });

        it.each([
            ['fetching the profile', 'getProfile'],
            ['switching identity', 'loadUser'],
        ] as const)(
            'enables the buttons again and lets the error through when %s fails',
            async (_label, failingCall) => {
                const error = new UnexpectedApiError('boom', 500);
                settingsApi[failingCall].mockRejectedValue(error);
                const wrapper = await mountWithMocks();

                await loadProfile(wrapper, VALID_UUID);
                vi.advanceTimersByTime(RELOAD_DELAY_MS);

                expect(noButtonDisabled(wrapper)).toBe(true);
                expect(notify).not.toHaveBeenCalled();
                expect(reload).not.toHaveBeenCalled();
                expect(errorHandler).toHaveBeenCalledWith(
                    error,
                    expect.anything(),
                    expect.any(String),
                );
                // nothing from the target profile is applied
                expect(localStorage.getItem(LocalStorageKeys.GAME_LIST)).toBe(
                    JSON.stringify(['MHW']),
                );
            },
        );
    });

    describe('deleting the stored data', () => {
        it('clears the storage, notifies and reloads after a delay, buttons kept disabled', async () => {
            const wrapper = await mountWithMocks();

            await button(wrapper, 'ui.page.settings.deleteUUID.button').trigger('click');

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

describe('SettingView without a stored identity', () => {
    beforeEach(() => {
        localStorage.clear();
        replaceMock.mockClear();
    });

    it('sends the player back home, replacing the settings entry in the history', async () => {
        await mountView();

        expect(replaceMock).toHaveBeenCalledExactlyOnceWith(paths.home);
    });

    it('stays on the page when an identity is stored', async () => {
        localStorage.setItem(LocalStorageKeys.USER_ID, STORED_USER_ID);

        await mountView();

        expect(replaceMock).not.toHaveBeenCalled();
    });
});
