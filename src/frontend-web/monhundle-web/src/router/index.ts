import AboutView from '@/views/AboutView.vue'
import UnlimitedGameView from '@/views/UnlimitedGameView.vue'
import SelectGamesView from '@/views/SelectGamesView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import DailyGameView from '@/views/DailyGameView.vue'

const SiteName= 'MonHundle'

export const paths = {
  unlimited: '/unlimited',
  selectGame: '/',
  daily: '/daily',
  about: '/about'
}

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
  ],
})
