import { LoadFailedError } from '@/domain/errors/NotifiedError/LoadFailedError';
import type ISettingApi from '@/domain/interfaces/api-contracts/ISettingApi';
import type ISettingsService from '@/domain/interfaces/services/ISettingsService';
import { isSupportedLocale, type SupportedLocale } from '@/domain/Settings';
import { isThemeId, type ThemeId } from '@/domain/Theme';
import { msUntilMidnightUTC } from '@/domain/Utils';
import { CookieKeys, deleteCookie, setCookie } from '@/services/CookieService';
import { type SettingsStore } from '@/stores/SettingsStore';
import { watch, type Ref } from 'vue';

export class SettingsService implements ISettingsService {
    private readonly settingsStore: SettingsStore;
    private readonly settingsApi: ISettingApi;
    private readonly i18nLocale: Ref<string>;

    public constructor(store: SettingsStore, api: ISettingApi, locale: Ref<string>) {
        this.settingsStore = store;
        this.settingsApi = api;
        this.i18nLocale = locale;

        watch(
            () => store.language,
            (language) => {
                const resolved: SupportedLocale = language ?? 'en';
                this.i18nLocale.value = resolved;
                document.documentElement.lang = resolved;
            },
            { immediate: true },
        );
    }

    public setLanguage(language: SupportedLocale | null): void {
        this.settingsStore.update({ language });
    }

    public setTheme(theme: ThemeId | null): void {
        this.settingsStore.update({ theme });
    }

    public setGameList(gameList: string[]): void {
        this.settingsStore.update({ gameList });
    }

    public setTableVisualAid(tableVisualAid: boolean): void {
        this.settingsStore.update({ tableVisualAid });
    }

    public resetSettings(): void {
        this.settingsStore.reset();
    }

    public async saveToProfile(): Promise<void> {
        await this.settingsApi.updateSettings({ ...this.settingsStore.$state });
    }

    public async loadProfile(targetUuid: string): Promise<void> {
        const userProfile = await this.settingsApi.getProfile(targetUuid);
        if (!userProfile) {
            throw new LoadFailedError(
                'could not load target profile during profile loading',
                'profile',
            );
        }
        await this.settingsApi.loadUser(targetUuid);

        this.setGameList(userProfile.preferences.gameList);
        this.setTableVisualAid(userProfile.preferences.tableVisualAid);

        const { theme, preferredLanguage } = userProfile.preferences;
        this.setLanguage(isSupportedLocale(preferredLanguage) ? preferredLanguage : null);
        this.setTheme(isThemeId(theme) ? theme : null);

        if (userProfile.currentDailyGameUuid) {
            setCookie(
                CookieKeys.CURRENT_DAILY_GAME,
                userProfile.currentDailyGameUuid,
                msUntilMidnightUTC(),
            );
        } else {
            deleteCookie(CookieKeys.CURRENT_DAILY_GAME);
        }

        if (userProfile.currentUnlimitedGameUuid) {
            setCookie(CookieKeys.CURRENT_UNLIMITED_GAME, userProfile.currentUnlimitedGameUuid);
        } else {
            deleteCookie(CookieKeys.CURRENT_UNLIMITED_GAME);
        }
    }
}
