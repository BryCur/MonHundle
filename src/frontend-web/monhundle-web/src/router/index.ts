import AboutView from '@/views/AboutView.vue';
import UnlimitedGameView from '@/views/UnlimitedGameView.vue';
import SelectGamesView from '@/views/SelectGamesView.vue';
import SettingsView from '@/views/SettingView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import DailyGameView from '@/views/DailyGameView.vue';
import { authManager } from '@/services/AuthManagementService';

const SiteName = 'MonHundle';

export const paths = {
    unlimited: '/unlimited',
    selectGame: '/',
    daily: '/daily',
    about: '/about',
    settings: '/settings',
};

// route "meta" objects are defined in env.d.ts
export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: paths.selectGame,
            name: `${SiteName}: home`,

            component: SelectGamesView,
        },
        {
            path: paths.unlimited,
            name: `${SiteName}: unlimited`,

            component: UnlimitedGameView,
        },
        {
            path: paths.daily,
            name: `${SiteName}: Daily`,

            component: DailyGameView,
        },
        {
            path: paths.about,
            name: `${SiteName}: about`,

            component: AboutView,
        },
        {
            path: paths.settings,
            name: `${SiteName}: Settings`,

            component: SettingsView,
        },
    ],
});

router.beforeEach(async (to) => {
    if (to.meta.public) {
        return true;
    }

    try {
        await authManager.whenAuthenticated;
        return true;
    } catch (err) {
        console.error('Authentication failed before navigation', err);

        // TODO error page to route toward instead of the about page.
        return to.path === paths.about ? true : { path: paths.about };
    }
});
