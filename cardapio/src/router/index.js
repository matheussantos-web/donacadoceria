import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Cardapio from '@/views/Cardapio.vue'
import CakeBuilder from '@/views/CakeBuilder.vue'
import Checkout from '@/views/Checkout.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/cardapio', name: 'Cardapio', component: Cardapio },
  { path: '/montar-bolo', name: 'CakeBuilder', component: CakeBuilder },
  { path: '/checkout', name: 'Checkout', component: Checkout },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
