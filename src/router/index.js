import { createRouter, createWebHistory } from 'vue-router'
import CatalogView from '@/views/CatalogView.vue'
import LoginView from '@/views/LoginView.vue'
import AdminProductsView from '@/views/AdminProductsView.vue'
import GestaoView from '@/views/GestaoView.vue'
import PhotoRedirectView from '@/views/PhotoRedirectView.vue'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated, authReadyPromise } = useAuth()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CatalogView,
      meta: { layout: 'default', title: 'Catálogo — Dona Cá Doceria' },
    },
    {
      path: '/f/:code',
      name: 'photo-redirect',
      component: PhotoRedirectView,
      meta: { layout: 'auth', title: 'Dona Cá Doceria — Confeitaria Artesanal' },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { layout: 'auth', title: 'Entrar — Dona Cá Doceria' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminProductsView,
      meta: { layout: 'auth', requiresAuth: true, title: 'Painel — Dona Cá Doceria' },
    },
    {
      path: '/vitrine',
      name: 'vitrine',
      component: CatalogView,
      meta: { layout: 'default', title: 'Vitrine — Dona Cá Doceria' },
    },
    {
      path: '/gestao',
      name: 'gestao',
      component: GestaoView,
      meta: { layout: 'auth', requiresAuth: true, title: 'Gestão — Dona Cá Doceria' },
    },
  ],
})

// Guarda de rota: aguarda a sessão inicial ser carregada antes de decidir redirecionamento
router.beforeEach(async (to, from, next) => {
  await authReadyPromise

  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

// Atualiza o title da página e a meta tag apple-mobile-web-app-title dinamicamente
router.afterEach((to) => {
  const pageTitle = to.meta.title || 'Dona Cá Doceria — Confeitaria Artesanal'
  document.title = pageTitle
  const meta = document.querySelector('meta[name="apple-mobile-web-app-title"]')
  if (meta) {
    meta.setAttribute('content', pageTitle)
  }
})

export default router
