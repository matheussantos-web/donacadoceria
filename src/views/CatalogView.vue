<script setup>
import { ref, computed, onMounted } from 'vue'
import { productService } from '@/services/products'
import { categories } from '@/data/products'
import ProductCard from '@/components/ProductCard.vue'
import ProductCustomizerModal from '@/components/catalog/ProductCustomizerModal.vue'
import CartCheckoutDrawer from '@/components/catalog/CartCheckoutDrawer.vue'
import FilterBar from '@/components/FilterBar.vue'
import EmptyState from '@/components/EmptyState.vue'

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
      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="font-display font-medium text-3xl sm:text-4xl text-brand-text-primary">
              Catálogo
            </h1>
            <p class="text-brand-text-muted mt-1">
              {{ filteredProducts.length }} item{{ filteredProducts.length !== 1 ? 's' : '' }} encontrada{{ filteredProducts.length !== 1 ? 's' : '' }}
              <span v-if="selectedCategory !== 'Todas'"> na categoria <strong class="text-brand-primary">{{ selectedCategory }}</strong></span>
            </p>
          </div>
        </div>

        <!-- Filter Bar -->
        <FilterBar
          :categories="categories"
          :selected-category="selectedCategory"
          @filter-change="handleFilterChange"
        />
      </header>

      <!-- Loading state -->
      <div v-if="loading" class="py-16 text-center">
        <p class="text-brand-text-muted">Carregando catálogo...</p>
      </div>

      <!-- Products Grid -->
      <div v-else-if="filteredProducts.length > 0">
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
    </div>

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
  </section>
</template>