import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import DailyGameView from '@/views/DailyGameView.vue';
import { dailyGameServiceKey, resourceServiceKey } from '@/injectionKeyRegistry';
import { CookieKeys, clearCookies, setCookie } from '@/services/CookieService';
import { GameSetupError } from '@/domain/errors/BlockingError/GameSetupError';
import { BackendUnavailableError } from '@/domain/errors/BlockingError/BackendUnavailableError';
import { ErrorReason } from '@/domain/errors/BlockingError/BaseBlockingError';
import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import { UnexpectedApiError } from '@/domain/errors/UnexpectedApiError';

// real (empty) i18n so `t()` resolves to the key path
const i18n = createI18n({
    legacy: false,
    globalInjection: false,
    missingWarn: false,
    fallbackWarn: false,
    locale: 'en',
    messages: { en: {} },
});

const EXISTING_GAME_ID = 'existing-daily-game';

function fakeGameService() {
    return {
        startNewGame: vi.fn().mockResolvedValue('new-daily-game'),
        resumeGame: vi.fn().mockResolvedValue(true),
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
    // the global error handler receives whatever escapes the async mounted hook
    const errorHandler = vi.fn();

    const wrapper = mount(DailyGameView, {
        global: {
            plugins: [i18n],
            provide: {
                [dailyGameServiceKey]: gameService,
                [resourceServiceKey]: resourceService,
            },
            stubs: { GameGuessList: true, MonsterSelectBox: true },
            config: { errorHandler },
        },
    });
    await flushPromises();

    return { wrapper, gameService, resourceService, errorHandler };
}

function isReady(wrapper: Awaited<ReturnType<typeof mountView>>['wrapper']): boolean {
    return wrapper.find('.game-page-container').exists();
}

describe('DailyGameView setup', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        clearCookies();
    });

    it('resumes the game from the cookie and becomes ready', async () => {
        setCookie(CookieKeys.CURRENT_DAILY_GAME, EXISTING_GAME_ID);

        const { wrapper, gameService, resourceService, errorHandler } = await mountView();

        expect(gameService.resumeGame).toHaveBeenCalledWith(EXISTING_GAME_ID);
        expect(gameService.startNewGame).not.toHaveBeenCalled();
        expect(resourceService.getMonsterOptions).toHaveBeenCalled();
        expect(isReady(wrapper)).toBe(true);
        expect(errorHandler).not.toHaveBeenCalled();
    });

    it('starts a new game when there is no cookie, and becomes ready', async () => {
        const { wrapper, gameService, errorHandler } = await mountView();

        expect(gameService.resumeGame).not.toHaveBeenCalled();
        expect(gameService.startNewGame).toHaveBeenCalledTimes(1);
        expect(isReady(wrapper)).toBe(true);
        expect(errorHandler).not.toHaveBeenCalled();
    });

    it('starts a new game when the game from the cookie cannot be resumed', async () => {
        setCookie(CookieKeys.CURRENT_DAILY_GAME, EXISTING_GAME_ID);
        const gameService = fakeGameService();
        gameService.resumeGame.mockResolvedValue(false);

        await mountView(gameService);

        expect(gameService.startNewGame).toHaveBeenCalledTimes(1);
    });
});

describe('DailyGameView setup failures', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        clearCookies();
    });

    it.each([
        [
            'resuming the game',
            (gameService: ReturnType<typeof fakeGameService>) => {
                setCookie(CookieKeys.CURRENT_DAILY_GAME, EXISTING_GAME_ID);
                gameService.resumeGame.mockRejectedValue(new UnexpectedApiError('boom', 500));
            },
        ],
        [
            'starting a new game',
            (gameService: ReturnType<typeof fakeGameService>) => {
                gameService.startNewGame.mockRejectedValue(new Error('game could not be set'));
            },
        ],
    ])('wraps a failure while %s in a GameSetupError', async (_label, arrange) => {
        const gameService = fakeGameService();
        arrange(gameService);

        const { wrapper, errorHandler } = await mountView(gameService);

        expect(errorHandler).toHaveBeenCalledTimes(1);
        const error = errorHandler.mock.calls[0]![0];
        expect(error).toBeInstanceOf(GameSetupError);
        expect(error.reason).toBe(ErrorReason.Critical);
        expect(error.cause).toBeInstanceOf(Error);
        expect(isReady(wrapper)).toBe(false);
    });

    it('wraps a failed monster list in a GameSetupError, keeping it as cause', async () => {
        const loadFailed = new LoadFailedError('Could not load monster options', 'MonsterOptions');
        const resourceService = fakeResourceService();
        resourceService.getMonsterOptions.mockRejectedValue(loadFailed);

        const { wrapper, errorHandler } = await mountView(fakeGameService(), resourceService);

        const error = errorHandler.mock.calls[0]![0];
        expect(error).toBeInstanceOf(GameSetupError);
        expect(error.cause).toBe(loadFailed);
        expect(isReady(wrapper)).toBe(false);
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
