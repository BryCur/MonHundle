import type ISettingsService from '@/domain/interfaces/services/ISettingsService';
import type { SupportedLocale } from '@/domain/Settings';
import type { ThemeId } from '@/domain/Theme';
import { type SettingsStore } from '@/stores/SettingsStore';
import { watch, type Ref } from 'vue';

export class SettingsService implements ISettingsService {
    private readonly settingsStore: SettingsStore;
    private readonly i18nLocale: Ref<string>;

    public constructor(store: SettingsStore, locale: Ref<string>) {
        this.settingsStore = store;
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
}
