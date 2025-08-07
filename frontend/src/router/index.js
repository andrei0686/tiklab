import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue' // Создайте этот компонент
import amplitude from '../views/amplitude.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/socket-test',
    name: 'SocketTest',
    component:  () => import('../views/SocketTestView.vue') // Ленивая загрузка
  },
  {
    path: '/amplitude',
    name: 'amplitude',
    component:  () => import('../views/amplitude.vue') // Ленивая загрузка
  }
  // {
  //   path: '/socktest',
  //   name: 'about',
  //   component: () => import('../views/SocketTestView.vue') // Ленивая загрузка
  // }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router