import type { SupportedLocale } from '@/domain/Settings';
import type { ThemeId } from '@/domain/Theme';

export default interface ISettingsService {
    setLanguage: (language: SupportedLocale | null) => void;
    setTheme: (theme: ThemeId | null) => void;
    setGameList: (gameList: string[]) => void;
    setTableVisualAid: (tableVisualAid: boolean) => void;
    resetSettings: () => void;
}
