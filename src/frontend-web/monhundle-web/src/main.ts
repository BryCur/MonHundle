import './assets/main.css';

import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';

import App from './App.vue';
import { router } from './router';

import en from './locales/en.json';
import fr from './locales/fr.json';

import { DailyGameService } from '@/services/DailyGameService';
import { UnlimitedGameService } from '@/services/UnlimitedGameService';
import { UnlimitedGameApi } from './services/ApiService/UnlimitedGameApi';
import ResourceApi from './services/ApiService/ResourceApi';
import { useGameStore } from './stores/GameStore';
import { DailyGameApi } from './services/ApiService/DailyGameApi';
import { SettingsApi } from '@/services/ApiService/SettingApi.ts';
import { authManager } from './services/AuthManagementService.ts';
import { ResourceService } from '@/services/ResourceService.ts';
import { reportError } from '@/domain/errors/NotifiedError/ErrorToNotification.ts';
import { useNotificationStore } from '@/stores/NotificationStore.ts';

const i18n = createI18n({
    legacy: false,
    // no global $t/$d/$n in templates: components get `t` from useI18n() explicitly
    globalInjection: false,
    locale: 'en', // langue par défaut
    fallbackLocale: 'en', // langue de secours
    messages: {
        en: en,
        fr: fr,
    },
});

const app = createApp(App);
app.use(createPinia());
const gameStore = useGameStore();
const notificationStore = useNotificationStore();

const unlimitedGameApi = new UnlimitedGameApi();
const unlimitedGameService = new UnlimitedGameService(unlimitedGameApi, gameStore);

const dailyGameApi = new DailyGameApi();
const dailyGameService = new DailyGameService(dailyGameApi, gameStore);

const resourceApi = new ResourceApi();
const resourceService = new ResourceService(resourceApi);

const settingsApi = new SettingsApi();

authManager.authenticate().catch(() => {});

app.use(router);
app.use(i18n);
app.provide('unlimitedGameService', unlimitedGameService);
app.provide('dailyGameService', dailyGameService);
app.provide('resourceService', resourceService);
app.provide('settingsApi', settingsApi);

// gate 1: errors raised from Vue
app.config.errorHandler = (error, _instance, info) => {
    reportError(error, notificationStore, `vue: ${info}`);
};

// gate 2: catch rejected promises (outside of vue) that were not handled
const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    reportError(event.reason, notificationStore, 'unhandled rejection');
};
window.addEventListener('unhandledrejection', onUnhandledRejection);

app.mount('#app');
