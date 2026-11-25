import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import UnlimitedGameView from '@/views/UnlimitedGameView.vue';
import { paths } from '@/router';
import {
    notificationEmitterKey,
    resourceServiceKey,
    unlimitedGameServiceKey,
} from '@/injectionKeyRegistry';
import { useSettingsStore } from '@/stores/SettingsStore';
import { clearCookies } from '@/services/CookieService';
import { GameSetupError } from '@/domain/errors/BlockingError/GameSetupError';
import { BackendUnavailableError } from '@/domain/errors/BlockingError/BackendUnavailableError';
import { ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';
import GameStatus from '@/domain/GameStatus';
import { GameModes, GameStates } from '@/domain/ApiModels';
import { NotificationTypes } from '@/domain/Notification';
import { useGameStore } from '@/stores/GameStore';
import { createMonsterSelectBoxStub } from '@test-utils/vitest/MonsterSelectBoxStub';

// real (empty) i18n so `t()` resolves to the key path
const i18n = createI18n({
    legacy: false,
    globalInjection: false,
    missingWarn: false,
    fallbackWarn: false,
    locale: 'en',
    messages: { en: {} },
});

const SELECTED_GAMES = ['MHW', 'MHR'];

const emptyView = { template: '<div />' };

// a dedicated router: the view only redirects to the game selection
function createTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: paths.selectGame, component: emptyView },
            { path: paths.unlimited, component: emptyView },
        ],
    });
}

function fakeGameService() {
    return {
        startNewGame: vi.fn().mockResolvedValue('new-unlimited-game'),
        resumeGame: vi.fn().mockResolvedValue(false),
        makeGuess: vi.fn(),
    };
}

function fakeResourceService() {
    return {
        getAllGameTitles: vi.fn(),
        getMonsterOptions: vi.fn().mockResolvedValue(['rathalos', 'nargacuga']),
    };
}

async function mountView(gameService = fakeGameService(), resourceService = fakeResourceService()) {
    const router = createTestRouter();
    await router.push(paths.unlimited);
    // the global error handler receives whatever escapes the async mounted hook
    const errorHandler = vi.fn();
    const notificationEmitter = { notify: vi.fn() };
    const selectBox = createMonsterSelectBoxStub();

    const wrapper = mount(UnlimitedGameView, {
        global: {
            plugins: [router, i18n],
            provide: {
                [unlimitedGameServiceKey]: gameService,
                [resourceServiceKey]: resourceService,
                [notificationEmitterKey]: notificationEmitter,
            },
            stubs: { GameGuessList: true, MonsterSelectBox: selectBox.stub },
            config: { errorHandler },
        },
    });
    await flushPromises();

    return {
        wrapper,
        selectBox,
        router,
        gameService,
        resourceService,
        errorHandler,
        notificationEmitter,
    };
}

function isReady(wrapper: Awaited<ReturnType<typeof mountView>>['wrapper']): boolean {
    return wrapper.find('.game-page-container').exists();
}

describe('UnlimitedGameView setup', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        clearCookies();
    });

    it('starts a game with the selected games and becomes ready', async () => {
        useSettingsStore().update({ gameList: SELECTED_GAMES });

        const { wrapper, gameService, resourceService, errorHandler } = await mountView();

        expect(gameService.startNewGame).toHaveBeenCalledTimes(1);
        expect(resourceService.getMonsterOptions).toHaveBeenCalledWith(SELECTED_GAMES);
        expect(isReady(wrapper)).toBe(true);
        expect(errorHandler).not.toHaveBeenCalled();
    });

    it('redirects to the game selection without any call when the games were never chosen', async () => {
        const { wrapper, router, gameService, resourceService, errorHandler } = await mountView();

        expect(router.currentRoute.value.path).toBe(paths.selectGame);
        expect(gameService.resumeGame).not.toHaveBeenCalled();
        expect(gameService.startNewGame).not.toHaveBeenCalled();
        expect(resourceService.getMonsterOptions).not.toHaveBeenCalled();
        expect(errorHandler).not.toHaveBeenCalled();
        expect(isReady(wrapper)).toBe(false);
    });

    it('plays with all the games when the selection is empty', async () => {
        useSettingsStore().update({ gameList: [] });

        const { wrapper, router, resourceService } = await mountView();

        expect(router.currentRoute.value.path).toBe(paths.unlimited);
        expect(resourceService.getMonsterOptions).toHaveBeenCalledWith([]);
        expect(isReady(wrapper)).toBe(true);
    });
});

describe('UnlimitedGameView setup failures', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        clearCookies();
        useSettingsStore().update({ gameList: SELECTED_GAMES });
    });

    it('wraps a failure while starting a game in a GameSetupError', async () => {
        const apiError = new UnexpectedApiError('boom', 500);
        const gameService = fakeGameService();
        gameService.startNewGame.mockRejectedValue(apiError);

        const { wrapper, errorHandler } = await mountView(gameService);

        expect(errorHandler).toHaveBeenCalledTimes(1);
        const error = errorHandler.mock.calls[0]![0];
        expect(error).toBeInstanceOf(GameSetupError);
        expect(error.reason).toBe(ErrorReason.Critical);
        expect(error.cause).toBe(apiError);
        expect(isReady(wrapper)).toBe(false);
    });

    it('wraps a failed monster list in a GameSetupError, keeping it as cause', async () => {
        const loadFailed = new LoadFailedError('Could not load monster options', 'MonsterOptions');
        const resourceService = fakeResourceService();
        resourceService.getMonsterOptions.mockRejectedValue(loadFailed);

        const { errorHandler } = await mountView(fakeGameService(), resourceService);

        const error = errorHandler.mock.calls[0]![0];
        expect(error).toBeInstanceOf(GameSetupError);
        expect(error.cause).toBe(loadFailed);
    });

    it('forwards an already blocking error as is', async () => {
        const unavailable = new BackendUnavailableError('Service unreachable');
        const gameService = fakeGameService();
        gameService.startNewGame.mockRejectedValue(unavailable);

        const { wrapper, errorHandler } = await mountView(gameService);

        expect(errorHandler).toHaveBeenCalledTimes(1);
        expect(errorHandler.mock.calls[0]![0]).toBe(unavailable);
        expect(isReady(wrapper)).toBe(false);
    });
});

describe('UnlimitedGameView share action', () => {
    let writeText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        clearCookies();
        useSettingsStore().update({ gameList: SELECTED_GAMES });
        // a finished game shows the game-over screen and its share button
        useGameStore().setGame(
            new GameStatus('finished-game', GameModes.Unlimited, [], GameStates.Win),
        );

        // jsdom has no clipboard: define one to spy on
        writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            configurable: true,
        });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    async function clickShare(wrapper: Awaited<ReturnType<typeof mountView>>['wrapper']) {
        const shareButton = wrapper
            .findAll('.option-game-over-container button')
            .find((button) => button.text() === 'ui.generic.share');
        await shareButton!.trigger('click');
        await flushPromises();
    }

    it('copies the shareable result and confirms it to the player', async () => {
        const { wrapper, notificationEmitter, errorHandler } = await mountView();

        await clickShare(wrapper);

        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText.mock.calls[0]![0]).toContain('ui.game.share.unlimited');
        expect(notificationEmitter.notify).toHaveBeenCalledTimes(1);
        expect(notificationEmitter.notify).toHaveBeenCalledWith({
            type: NotificationTypes.Info,
            messageKey: 'ui.notification.info.gameCopied.message',
        });
        expect(errorHandler).not.toHaveBeenCalled();
    });

    it('tells the player when the clipboard refuses the copy, without a success message', async () => {
        writeText.mockRejectedValue(new DOMException('Write permission denied', 'NotAllowedError'));
        const { wrapper, notificationEmitter, errorHandler } = await mountView();

        await clickShare(wrapper);

        expect(notificationEmitter.notify).toHaveBeenCalledTimes(1);
        expect(notificationEmitter.notify).toHaveBeenCalledWith({
            type: NotificationTypes.Error,
            messageKey: 'ui.notification.error.gameShareCopyFailed.message',
        });
        expect(errorHandler).not.toHaveBeenCalled();
    });
});

describe('UnlimitedGameView guess sending', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        clearCookies();
        useSettingsStore().update({ gameList: SELECTED_GAMES });
    });

    type Mounted = Awaited<ReturnType<typeof mountView>>;

    function getSendButton(wrapper: Mounted['wrapper']) {
        return wrapper.find('.option-selector-container button');
    }

    function getSelectBox({ wrapper, selectBox }: Mounted) {
        return wrapper.findComponent(selectBox.stub);
    }

    async function selectMonster(mounted: Mounted, monsterCode: string) {
        getSelectBox(mounted).vm.$emit('update:modelValue', monsterCode);
        await flushPromises();
    }

    it('disables the send button until a monster is selected', async () => {
        const mounted = await mountView();

        expect(getSendButton(mounted.wrapper).attributes('disabled')).toBeDefined();

        await selectMonster(mounted, 'rathalos');

        expect(getSendButton(mounted.wrapper).attributes('disabled')).toBeUndefined();
    });

    it('sends the selected monster, then clears the selection and gives the focus back', async () => {
        const mounted = await mountView();
        await selectMonster(mounted, 'rathalos');

        await getSendButton(mounted.wrapper).trigger('click');
        await flushPromises();

        expect(mounted.gameService.makeGuess).toHaveBeenCalledTimes(1);
        expect(mounted.gameService.makeGuess).toHaveBeenCalledWith('rathalos');
        expect(getSelectBox(mounted).props('modelValue')).toBeUndefined();
        expect(mounted.selectBox.focus).toHaveBeenCalledTimes(1);
        expect(mounted.errorHandler).not.toHaveBeenCalled();
    });

    it('sends the guess when the select box asks for it (Enter)', async () => {
        const mounted = await mountView();
        await selectMonster(mounted, 'rathalos');

        getSelectBox(mounted).vm.$emit('submit');
        await flushPromises();

        expect(mounted.gameService.makeGuess).toHaveBeenCalledWith('rathalos');
    });

    it('sends nothing when asked to without a selected monster', async () => {
        const mounted = await mountView();

        getSelectBox(mounted).vm.$emit('submit');
        await flushPromises();

        expect(mounted.gameService.makeGuess).not.toHaveBeenCalled();
    });

    it('sends a single guess while the previous one is still pending', async () => {
        let answerGuess!: () => void;
        const gameService = fakeGameService();
        gameService.makeGuess.mockReturnValue(
            new Promise<void>((resolve) => (answerGuess = resolve)),
        );
        const mounted = await mountView(gameService);
        await selectMonster(mounted, 'rathalos');

        await getSendButton(mounted.wrapper).trigger('click');
        getSelectBox(mounted).vm.$emit('submit');
        await flushPromises();

        expect(gameService.makeGuess).toHaveBeenCalledTimes(1);
        expect(getSendButton(mounted.wrapper).attributes('disabled')).toBeDefined();

        answerGuess();
        await flushPromises();
        await selectMonster(mounted, 'nargacuga');

        expect(getSendButton(mounted.wrapper).attributes('disabled')).toBeUndefined();
    });

    it('keeps the selection and lets the player retry when the guess fails', async () => {
        const failure = new UnexpectedApiError('boom', 500);
        const gameService = fakeGameService();
        gameService.makeGuess.mockRejectedValue(failure);
        const mounted = await mountView(gameService);
        await selectMonster(mounted, 'rathalos');

        await getSendButton(mounted.wrapper).trigger('click');
        await flushPromises();

        // the failure still reaches the global error handling
        expect(mounted.errorHandler).toHaveBeenCalledTimes(1);
        expect(mounted.errorHandler.mock.calls[0]![0]).toBe(failure);
        expect(getSelectBox(mounted).props('modelValue')).toBe('rathalos');
        expect(getSendButton(mounted.wrapper).attributes('disabled')).toBeUndefined();
        expect(mounted.selectBox.focus).not.toHaveBeenCalled();
    });

    it('does not fail when the guess ends the game and removes the select box', async () => {
        const gameService = fakeGameService();
        gameService.makeGuess.mockImplementation(async () => {
            useGameStore().setGame(
                new GameStatus('finished-game', GameModes.Unlimited, [], GameStates.Win),
            );
        });
        const mounted = await mountView(gameService);
        await selectMonster(mounted, 'rathalos');

        await getSendButton(mounted.wrapper).trigger('click');
        await flushPromises();

        expect(mounted.wrapper.findComponent(mounted.selectBox.stub).exists()).toBe(false);
        expect(mounted.selectBox.focus).not.toHaveBeenCalled();
        expect(mounted.errorHandler).not.toHaveBeenCalled();
    });
});
