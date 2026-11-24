<template>
  <div class="min-h-screen bg-brand-creme pt-20 pb-12">
    <AppHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="font-display text-3xl text-brand-cacau font-bold">
            Cardápio
          </h2>
          <p class="text-brand-cacau/60 text-sm">
            Doces prontos para entregar e bolos sob encomenda.
          </p>
        </div>

        <!-- Filtros rápidos -->
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            v-for="f in FILTROS"
            :key="f.chave"
            @click="filtroAtivo = f.chave"
            class="whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="{
              'bg-brand-rose text-white': filtroAtivo === f.chave,
              'bg-white text-brand-cacau/70 border border-brand-mauve/20 hover:bg-brand-rose/10': filtroAtivo !== f.chave,
            }"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Produtos -->
      <div
        v-if="produtosFiltrados.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <ProductCard
          v-for="p in produtosFiltrados"
          :key="p.id"
          :produto="p"
          @adicionar="adicionarSacola"
        />
      </div>

      <!-- Estado vazio -->
      <div v-else class="text-center py-20">
        <div class="w-16 h-16 rounded-full bg-brand-creme flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-brand-mauve/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="font-display text-xl text-brand-cacau font-bold mb-2">Nenhum doce encontrado</h3>
        <p class="text-brand-cacau/50 text-sm">Tente outro filtro ou volte ao cardápio completo.</p>
      </div>

      <CartDrawer v-model:aberta="sacolaAberta" />
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PRODUTOS, FILTROS } from '@/data/catalogo'
import ProductCard from '@/components/ProductCard.vue'
import CartDrawer from '@/components/CartDrawer.vue'

const filtroAtivo = ref('todos')
const sacolaAberta = ref(false)

const produtosFiltrados = computed(() => {
  if (filtroAtivo.value === 'todos') return PRODUTOS
  return PRODUTOS.filter((p) => p.tags.some((t) => t.includes(filtroAtivo.value)))
})

function adicionarSacola(produto) {
  sacolaAberta.value = true
}
</script>
