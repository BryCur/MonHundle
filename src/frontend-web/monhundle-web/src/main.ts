import '@/assets/main.css';

import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';

import App from '@/App.vue';
import { router } from '@/router';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

import { DailyGameService } from '@/services/DailyGameService';
import { UnlimitedGameService } from '@/services/UnlimitedGameService';
import { UnlimitedGameApi } from '@/services/ApiService/UnlimitedGameApi';
import ResourceApi from '@/services/ApiService/ResourceApi';
import { useGameStore } from '@/stores/GameStore';
import { DailyGameApi } from '@/services/ApiService/DailyGameApi';
import { SettingsApi } from '@/services/ApiService/SettingApi';
import { authManager } from '@/services/AuthManagementService';
import { ResourceService } from '@/services/ResourceService';
import { createErrorReporter } from '@/domain/errors/ErrorUtils';
import { useNotificationStore } from '@/stores/NotificationStore';
import {
    dailyGameServiceKey,
    notificationEmitterKey,
    resourceServiceKey,
    settingsApiKey,
    unlimitedGameServiceKey,
} from '@/injectionKeyRegistry';
import { createErrorRouterNavigator } from '@/router/ErrorNavigator';

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
app.provide(unlimitedGameServiceKey, unlimitedGameService);
app.provide(dailyGameServiceKey, dailyGameService);
app.provide(resourceServiceKey, resourceService);
app.provide(settingsApiKey, settingsApi);
app.provide(notificationEmitterKey, notificationStore);

const errorNavigator = createErrorRouterNavigator(router);
const reportError = createErrorReporter(notificationStore, errorNavigator);

// gate 1: errors raised from Vue
app.config.errorHandler = (error, _instance, info) => {
    reportError(error, `vue: ${info}`);
};

// gate 2: catch rejected promises (outside of vue) that were not handled
const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    reportError(event.reason, 'unhandled rejection');
};
window.addEventListener('unhandledrejection', onUnhandledRejection);

app.mount('#app');
