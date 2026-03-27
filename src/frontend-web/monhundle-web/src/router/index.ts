import AboutView from '@/views/AboutView.vue'
import UnlimitedGameView from '@/views/UnlimitedGameView.vue'
import SelectGamesView from '@/views/SelectGamesView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import DailyGameView from '@/views/DailyGameView.vue'

const SiteName= "MonHundle"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: `${SiteName}: home`,
      component: SelectGamesView,
    },
    {
      path: '/unlimited',
      name: `${SiteName}: unlimited`,

      component: UnlimitedGameView,
    },
    {
      path: '/daily',
      name: `${SiteName}: Daily`,

      component: DailyGameView,
    },
    {
      path: '/about',
      name: `${SiteName}: about`,

      component: AboutView,
    },
  ],
})

export default router
