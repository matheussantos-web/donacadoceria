<script setup>
import { ref, computed, onMounted } from 'vue'
import { productService } from '@/services/products'
import { categories } from '@/data/products'
import ProductCard from '@/components/ProductCard.vue'
import ProductCustomizerModal from '@/components/catalog/ProductCustomizerModal.vue'
import CartCheckoutDrawer from '@/components/catalog/CartCheckoutDrawer.vue'
import FilterBar from '@/components/FilterBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { ChevronRight } from 'lucide-vue-next'

const selectedCategory = ref('Todas')
const products = ref([])
const loading = ref(true)
const showCustomizer = ref(false)
const productForCustomizer = ref(null)
const showCart = ref(false)

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'Todas') return products.value
  return products.value.filter((p) => p.category === selectedCategory.value)
})

const featuredProducts = computed(() =>
  products.value.filter((p) => p.isFeatured && p.available)
)

const handleFilterChange = (categoryId) => {
  selectedCategory.value = categoryId
}

async function loadProducts() {
  loading.value = true
  try {
    products.value = await productService.list()
  } catch (err) {
    console.warn('[CatalogView] Falha ao carregar produtos do serviço.', err.message)
    products.value = []
  } finally {
    loading.value = false
  }
}

function openCustomizer(product) {
  productForCustomizer.value = product
  showCustomizer.value = true
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <section id="catalogo" class="py-8 px-4 bg-brand-bg min-h-[calc(100vh-200px)]">
    <div class="max-w-screen-xl mx-auto">

      <!-- Hero Editorial -->
      <header class="relative mb-12 px-4 sm:px-0">
        <div class="max-w-3xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary text-[10px] font-medium uppercase tracking-wider mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-secondary"></span>
            Artesanal · Sob encomenda
          </div>
          <h1 class="font-fraunces font-bold text-4xl sm:text-6xl lg:text-7xl text-brand-text-primary mb-4 tracking-tight leading-tight">
            Doces feitos<br />
            com afeto.
          </h1>
          <p class="font-sans text-lg sm:text-xl text-brand-text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Bolos, doces finos e sobremesas produzidos de forma artesanal no
            Atelier Dona Ca Doceria. Tudo sob encomenda, com ingredientes
            selecionados e muito carinho.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#catalogo"
              class="btn-primary px-8 py-4 text-base font-semibold"
            >
              Ver Cardápio
            <span class="ml-1"><ChevronRight class="w-4 h-4" /></span>
            </a>
          </div>
        </div>

        <!-- Decorative blur blobs -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
          <div class="absolute top-[-10%] left-[-10%] w-72 h-72 bg-brand-primary/10 rounded-full blur-[100px]"></div>
          <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-secondary/10 rounded-full blur-[120px]"></div>
        </div>
      </header>


      <!-- Chamada em destaque: Montador de Bolos -->
      <section class="mb-10">
        <div class="bg-brand-rose/10 border border-brand-rose/30 rounded-2xl p-6 sm:p-8 text-center sm:text-start">
          <div class="max-w-2xl mx-auto sm:mx-0">
            <h3 class="font-display font-bold text-2xl text-brand-cacau mb-2">
              Monte seu Bolo Personalizado
            </h3>
            <p class="text-brand-cacau/70 text-sm sm:text-base mb-4">
              Escolha linha, tamanho (P, M, G, GG), massa, recheios e cobertura. O preço é calculado em tempo real.
            </p>
            <router-link
              to="/montar-bolo"
              class="btn-primary text-sm font-semibold"
            >
              Criar Meu Bolo
              <span class="ml-1">›</span>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Barra de Categorias (sticky, scroll horizontal limpo) -->
      <FilterBar
        :categories="categories"
        :selected-category="selectedCategory"
        @filter-change="handleFilterChange"
        class="sticky top-[96px] z-30 mb-8"
      />

      <!-- Loading state -->
      <div v-if="loading" class="py-16 text-center">
        <p class="text-brand-text-muted">Carregando catálogo…</p>
      </div>

      <!-- Destaques / Mais Pedidos -->
      <div
        v-if="!loading && featuredProducts.length > 0 && selectedCategory.value === 'Todas'"
        class="mb-10 fade-in"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-fraunces font-bold text-2xl sm:text-3xl text-brand-text-primary">
            Mais Pedidos
          </h2>
          <a
            href="#catalogo"
            class="font-sans text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1"
          >
            Ver tudo
            <span><ChevronRight class="w-4 h-4" /></span>
          </a>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
            :selected-category="selectedCategory"
            class="flex-shrink-0 w-[260px] sm:w-[300px]"
          />
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="filteredProducts.length > 0">
        <h2
          v-if="selectedCategory !== 'Todas'"
          class="font-fraunces font-bold text-2xl sm:text-3xl text-brand-text-primary mb-6"
        >
          {{ selectedCategory }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            :selected-category="selectedCategory"
          />
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else
        :message="selectedCategory !== 'Todas' ? `Nenhum item na categoria ${selectedCategory}.` : 'Nenhum item cadastrado.'"
        :sub-message="selectedCategory !== 'Todas' ? 'Tente outra categoria ou veja todos os itens.' : 'Em breve novos itens chegarão.'"
        @clear-filter="() => selectedCategory = 'Todas'"
      />

      <!-- Product Customizer Modal -->
      <ProductCustomizerModal
        v-if="showCustomizer && productForCustomizer"
        :product="productForCustomizer"
        @added="showCustomizer = false; showCart = true"
        @close="showCustomizer = false"
      />

      <!-- Cart Checkout Drawer -->
      <CartCheckoutDrawer
        v-if="showCart"
        :is-open="showCart"
        @close="showCart = false"
      />
    </div>
  </section>
</template>

<style>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.fade-in {
  animation: fadeIn 0.6s ease-out both;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>