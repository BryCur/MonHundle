import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 🔹 Import des traductions
import en from './locales/en.json'
import fr from './locales/fr.json'
import { UserApi } from './services/ApiService/UserApi'

const i18n = createI18n({
    legacy: false,
    locale: 'en', // langue par défaut
    fallbackLocale: 'en', // langue de secours
    messages: {
        en: en,
        fr: fr
    }
});

const app = createApp(App);

new UserApi().authUser();

app.use(createPinia());
app.use(router);
app.use(i18n);

app.mount('#app')
