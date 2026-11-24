<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-mauve/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo + navegação -->
        <div class="flex items-center gap-4">
          <router-link
            to="/"
            class="flex items-center gap-2"
            aria-label="Página inicial"
          >
            <div class="w-10 h-10 rounded-full bg-brand-rose flex items-center justify-center shadow-lg shadow-brand-rose/30">
              <span class="text-white font-display font-bold text-sm">DC</span>
            </div>
            <span class="font-display font-bold text-xl text-brand-cacau tracking-tight">
              Dona Ca<br class="hidden sm:block" /><span class="text-xs text-brand-rose/70 font-body font-medium uppercase tracking-wider">Doceria</span>
            </span>
          </router-link>

          <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-brand-cacau/90">
            <router-link
              v-for="link in linksNav"
              :key="link.to"
              :to="link.to"
              class="transition-colors hover:text-brand-rose font-medium"
              :class="{ 'text-brand-rose': $route.name === link.name }"
            >
              {{ link.label }}
            </router-link>
          </nav>
        </div>

        <!-- Sacola -->
        <div class="flex items-center gap-4">
          <button
            @click="abrirSacola"
            class="relative p-2 text-brand-cacau hover:text-brand-rose transition-colors"
            aria-label="Sacola de compras"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
            <span
              v-if="totalItens > 0"
              class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-berry text-white text-[10px] font-bold shadow-lg"
            >
              {{ totalItens }}
            </span>
          </button>
          <button
            @click="$router.push('/montar-bolo')"
            class="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-rose text-white text-xs font-bold rounded-full transition-all hover:bg-brand-berry hover:shadow-lg hover:shadow-brand-rose/30"
          >
            <span>Montar Bolo</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5L6 15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'

const router = useRouter()
const { totalItens } = useCart()

const linksNav = [
  { to: '/', name: 'Home', label: 'Início' },
  { to: '/cardapio', name: 'Cardapio', label: 'Cardápio' },
  { to: '/montar-bolo', name: 'CakeBuilder', label: 'Monte seu Bolo' },
  { to: '#regras', label: 'Regras e Prazos' },
]

const abrirSacola = () => {
  router.push({ name: 'Checkout' })
}
</script>
