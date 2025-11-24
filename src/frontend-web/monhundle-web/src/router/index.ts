import AboutView from '@/views/AboutView.vue'
import GameView from '@/views/GameView.vue'
import SelectGamesView from '@/views/SelectGamesView.vue'
import { createRouter, createWebHistory } from 'vue-router'

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

      component: GameView,
    },
    {
      path: '/about',
      name: `${SiteName}: about`,

      component: AboutView,
    },
  ],
})

export default router
