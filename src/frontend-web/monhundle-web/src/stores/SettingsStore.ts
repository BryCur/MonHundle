import { createDefaultSettings, type Settings } from '@/domain/Settings';
import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
    state: (): Settings => createDefaultSettings(),
    actions: {
        update(changes: Partial<Settings>): void {
            this.$patch((state) => {
                if (changes.gameList !== undefined) {
                    state.gameList = [...changes.gameList];
                }

                if (changes.language !== undefined) {
                    state.language = changes.language;
                }

                if (changes.tableVisualAid !== undefined) {
                    state.tableVisualAid = changes.tableVisualAid;
                }

                if (changes.theme !== undefined) {
                    state.theme = changes.theme;
                }
            });
        },
        reset(): void {
            this.$reset();
        },
    },
});

export type SettingsStore = ReturnType<typeof useSettingsStore>;
