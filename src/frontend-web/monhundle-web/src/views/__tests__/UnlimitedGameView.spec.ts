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
import { LocalStorageKeys } from '@/services/LocalStorageService';
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

    const wrapper = mount(UnlimitedGameView, {
        global: {
            plugins: [router, i18n],
            provide: {
                [unlimitedGameServiceKey]: gameService,
                [resourceServiceKey]: resourceService,
                [notificationEmitterKey]: notificationEmitter,
            },
            stubs: { GameGuessList: true, MonsterSelectBox: true },
            config: { errorHandler },
        },
    });
    await flushPromises();

    return { wrapper, router, gameService, resourceService, errorHandler, notificationEmitter };
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
        localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(SELECTED_GAMES));

        const { wrapper, gameService, resourceService, errorHandler } = await mountView();

        expect(gameService.startNewGame).toHaveBeenCalledTimes(1);
        expect(resourceService.getMonsterOptions).toHaveBeenCalledWith(SELECTED_GAMES);
        expect(isReady(wrapper)).toBe(true);
        expect(errorHandler).not.toHaveBeenCalled();
    });

    it('redirects to the game selection without any call when no games are selected', async () => {
        const { wrapper, router, gameService, resourceService, errorHandler } = await mountView();

        expect(router.currentRoute.value.path).toBe(paths.selectGame);
        expect(gameService.resumeGame).not.toHaveBeenCalled();
        expect(gameService.startNewGame).not.toHaveBeenCalled();
        expect(resourceService.getMonsterOptions).not.toHaveBeenCalled();
        expect(errorHandler).not.toHaveBeenCalled();
        expect(isReady(wrapper)).toBe(false);
    });
});

describe('UnlimitedGameView setup failures', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        clearCookies();
        localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(SELECTED_GAMES));
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

    it('wraps a corrupted game selection in a GameSetupError', async () => {
        localStorage.setItem(LocalStorageKeys.GAME_LIST, '{not json');

        const { errorHandler } = await mountView();

        const error = errorHandler.mock.calls[0]![0];
        expect(error).toBeInstanceOf(GameSetupError);
        expect(error.cause).toBeInstanceOf(SyntaxError);
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
        localStorage.setItem(LocalStorageKeys.GAME_LIST, JSON.stringify(SELECTED_GAMES));
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
