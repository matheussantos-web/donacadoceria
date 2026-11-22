<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-display font-medium text-2xl text-brand-text-primary">
          Precificação de Bolos &amp; Kits
        </h2>
        <p class="text-brand-text-muted">
          Monte produtos finais, calcule custo de produção e defina margem de lucro.
        </p>
      </div>
      <button
        @click="openProductModal()"
        class="btn-primary px-4 py-2 text-sm font-medium flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        Novo Produto
      </button>
    </div>

    <!-- Lista de produtos precificados -->
    <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
      <div v-if="products.length === 0" class="text-center py-8 text-brand-text-muted">
        <p>Nenhum produto precificado ainda.</p>
        <button @click="openProductModal()" class="btn-primary mt-4 px-4 py-2">
          Cadastrar primeiro produto
        </button>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="product in products"
          :key="product.id"
          class="bg-brand-bg border border-gray-200 rounded-lg p-4 flex flex-col"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-brand-text-primary">{{ product.name }}</h4>
            <span
              class="px-2 py-1 rounded text-[10px] font-medium uppercase text-brand-text-muted bg-brand-bg/50"
            >
              {{ product.productType === 'bolo_fatias' ? 'Bolo por Fatias' : product.productType === 'doce_unidade' ? 'Doce Unidade' : 'Kit Festa' }}
            </span>
          </div>
          <p class="text-xs text-brand-text-muted mb-3">
            {{ product.productType === 'bolo_fatias' && product.yieldSlices ? product.yieldSlices + ' fatias' : '' }}
          </p>
          <div class="space-y-1 text-sm mb-3">
            <div class="flex justify-between">
              <span class="text-brand-text-muted">Custo de produção:</span>
              <span class="font-medium text-brand-text-primary">
                R$ {{ formatPrice(product.totalProductionCost) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-brand-text-muted">Preço final:</span>
              <span class="font-medium text-brand-text-primary">
                R$ {{ formatPrice(product.finalPrice) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-brand-text-muted">Margem:</span>
              <span class="font-medium text-brand-text-primary">
                {{ product.targetMarginPercent }}%
              </span>
            </div>
            <!-- Barra segmentada: Custo vs Lucro -->
            <div class="mt-2">
              <div class="flex items-center gap-1 mb-1 text-xs">
                <span class="text-brand-text-muted font-medium">Custo de produção</span>
                <span class="text-brand-text-muted font-medium">Lucro líquido</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  class="h-full bg-brand-primary transition-all duration-300"
                  :style="{ width: costPercentage(product) + '%' }"
                ></div>
                <div
                  class="h-full bg-emerald-500 transition-all duration-300"
                  :style="{ width: profitPercentage(product) + '%' }"
                ></div>
              </div>
              <div class="flex justify-between text-[10px] font-medium mt-1">
                <span class="text-brand-text-muted">
                  R$ {{ formatPrice(product.totalProductionCost) }}
                  ({{ Math.round(costPercentage(product)) }}%)
                </span>
                <span class="text-emerald-600">
                  R$ {{ formatPrice(Math.max(0, product.finalPrice - product.totalProductionCost)) }}
                  ({{ Math.round(profitPercentage(product)) }}%)
                </span>
              </div>
            </div>
          </div>
          <div v-if="productMarginNeedsReview(product)" class="mb-3">
            <div class="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 border border-amber-100 text-amber-800 text-xs font-medium mb-1">
              <span class="text-sm text-amber-800 flex items-center gap-2">
                <AlertTriangle class="w-4 h-4 text-amber-600" />
                Margem abaixo do alvo — reajustar preço
              </span>
            </div>
            <button
              @click="applySuggestedPrice(product)"
              class="w-full btn-primary py-1.5 text-xs font-medium"
            >
              Aplicar preço sugerido (R$ {{ formatPrice(product.suggestedPrice) }})
            </button>
          </div>
          <div class="mt-auto pt-3 border-t border-gray-100 flex gap-2">
            <button
              @click="openProductModal(product)"
              class="flex-1 btn-secondary py-1.5 text-xs font-medium"
            >
              Editar
            </button>
            <button
              @click="deleteProduct(product.id)"
              class="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de precificação -->
    <div
      v-if="showProductModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeProductModal"
    >
      <div
        class="bg-brand-surface border border-gray-100 rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-display font-medium text-lg text-brand-text-primary">
            {{ editingProduct ? 'Editar Produto' : 'Novo Produto' }}
          </h3>
          <button
            @click="closeProductModal"
            class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
            aria-label="Fechar"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveProduct" class="p-6 space-y-6">
          <!-- Nome e tipo -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Nome do produto
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Tipo de produto
              </label>
              <select
                v-model="form.productType"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              >
                <option value="bolo_fatias">Bolo por Fatias</option>
                <option value="doce_unidade">Doce por Unidade/Cento</option>
                <option value="kit_festa">Kit Festa</option>
              </select>
            </div>
          </div>

          <!-- Fatias (apenas bolo_fatias) -->
          <div v-if="form.productType === 'bolo_fatias'">
            <label class="block text-sm font-medium text-brand-text-muted mb-1">
              Quantidade de fatias
            </label>
            <input
              v-model.number="form.yieldSlices"
              type="number"
              step="1"
              min="1"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
            />
          </div>

          <!-- Componentes de receita -->
          <div class="pt-4 border-t border-gray-100">
            <h4 class="font-medium text-brand-text-primary mb-3">Receitas e Embalagens</h4>
            <p class="text-xs text-brand-text-muted mb-3">
              Selecione quais receitas e embalagens entram na composição e a quantidade/multiplicador.
            </p>

            <div
              v-for="(comp, idx) in form.components"
              :key="idx"
              class="flex gap-2 items-end mb-2 bg-brand-bg/50 p-3 rounded border border-gray-100"
            >
              <select
                v-model="comp.recipeId"
                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
              >
                <option value="">Selecionar receita...</option>
                <option v-for="recipe in availableRecipes" :key="recipe.id" :value="recipe.id">
                  {{ recipe.name }} (R$ {{ formatPrice(recipe.unitCost) }}/{{ recipe.yieldUnit }})
                </option>
              </select>

              <input
                v-model.number="comp.multiplierOrQty"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Qtd"
                class="w-24 px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm text-right"
              />

              <span class="w-20 text-xs text-brand-text-muted text-right">
                {{ comp.recipeId ? formatPrice(comp.costContribution || 0) : '—' }}
              </span>

              <button
                @click="removeComponent(idx)"
                class="text-red-600 hover:text-red-800 text-xs"
              >
                <X class="w-3 h-3" />
              </button>
            </div>

            <button
              @click="addComponentRow()"
              class="text-xs text-brand-primary underline hover:text-brand-accent ml-1 mt-2"
            >
              + Adicionar receita/embalagem
            </button>
          </div>

          <!-- Custo total -->
          <div class="pt-3 border-t border-gray-100 flex justify-between mb-3">
            <span class="font-medium text-brand-text-primary">Custo total de produção:</span>
            <span class="font-display font-medium text-xl text-brand-text-primary">
              {{ formatPrice(productTotalCost) }}
            </span>
          </div>

          <!-- Margem e preço -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Margem de lucro desejada (%)
              </label>
              <input
                v-model.number="form.targetMarginPercent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Preço final de venda (R$)
              </label>
              <input
                v-model.number="form.finalPrice"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
          </div>

          <!-- Resultado -->
          <div class="bg-brand-bg/50 rounded-lg p-4 mt-4">
            <div class="flex justify-between mb-1">
              <span class="text-brand-text-muted text-sm">Preço sugerido (com margem):</span>
              <span class="font-medium text-brand-primary">
                R$ {{ formatPrice(suggestedPrice) }}
              </span>
            </div>
            <div class="flex justify-between mb-1">
              <span class="text-brand-text-muted text-sm">Lucro líquido por unidade:</span>
              <span class="font-medium text-brand-text-primary">
                R$ {{ formatPrice(profitPerUnit) }}
              </span>
            </div>
            <div class="flex justify-between mb-1">
              <span class="text-brand-text-muted text-sm">Margem real (%):</span>
              <span
                class="font-medium"
                :class="realMargin >= 20 ? 'text-brand-primary' : realMargin >= 10 ? 'text-brand-secondary' : 'text-red-600'"
              >
                {{ formatPercent(realMargin) }}%
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-brand-text-muted text-sm">Saudável:</span>
              <span
                class="font-medium"
                :class="realMargin >= 20 ? 'text-brand-primary' : realMargin >= 10 ? 'text-brand-secondary' : 'text-red-600'"
              >
                {{ realMargin >= 20 ? 'Sim' : realMargin >= 10 ? 'Atenção' : 'Baixo' }}
              </span>
            </div>
          </div>

          <div v-if="form.publishedToCatalog !== undefined" class="flex items-center gap-2 mt-3">
            <input
              id="publishedToCatalog"
              v-model="form.publishedToCatalog"
              type="checkbox"
              class="rounded border-brand-primary text-brand-primary focus:ring-brand-primary"
            />
            <label for="publishedToCatalog" class="text-sm text-brand-text-muted">
              Publicar no catálogo público
            </label>
          </div>

          <!-- Ações -->
          <div class="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              @click="closeProductModal"
              class="px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="savingProduct"
              class="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
            >
              {{ savingProduct ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { recipesService, pricedProductsService, pricedProductComponentsService } from '@/services/recipes'
import { useToast } from '@/composables/useToast'
import { Plus, AlertTriangle, X } from 'lucide-vue-next'

const props = defineProps({})
const emit = defineEmits([])
const { success, error: toastError } = useToast()

// State
const products = ref([])
const availableRecipes = ref([])
const loading = ref(false)
const error = ref('')

// Modal state
const showProductModal = ref(false)
const editingProduct = ref(null)
const savingProduct = ref(false)

const form = ref({
  name: '',
  productType: 'bolo_fatias',
  yieldSlices: null,
  totalProductionCost: 0,
  targetMarginPercent: 30,
  finalPrice: 0,
  publishedToCatalog: false,
  components: [],
})

watch(
  () => form.targetMarginPercent,
  () => {
    calcSuggestedPrice()
  }
)

watch(
  () => form.finalPrice,
  () => {
    calcMarginFromFinalPrice()
  }
)

const productTotalCost = computed(() => {
  return (form.components || []).reduce((sum, comp) => sum + (comp.costContribution || 0), 0)
})

const suggestedPrice = computed(() => {
  const cost = productTotalCost.value
  const margin = form.targetMarginPercent || 0
  if (margin >= 100) return 0
  return cost / (1 - margin / 100)
})

const profitPerUnit = computed(() => {
  return form.finalPrice - productTotalCost.value
})

const realMargin = computed(() => {
  if (form.finalPrice <= 0) return 0
  return ((form.finalPrice - productTotalCost.value) / form.finalPrice) * 100
})

const formatPercent = (num) => Number(num).toFixed(1)

const formatPrice = (price) => {
  if (price == null || Number.isNaN(Number(price))) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(price))
}

// Percentuais para barra segmentada Custo vs Lucro
const costPercentage = (product) => {
  const finalPrice = Number(product.finalPrice) || 0
  const cost = Number(product.totalProductionCost) || 0
  if (finalPrice <= 0) return 0
  return Math.min(100, Math.round((cost / finalPrice) * 100))
}

const profitPercentage = (product) => {
  const finalPrice = Number(product.finalPrice) || 0
  const cost = Number(product.totalProductionCost) || 0
  if (finalPrice <= 0) return 0
  const profit = Math.max(0, finalPrice - cost)
  return Math.min(100, Math.round((profit / finalPrice) * 100))
}

onMounted(() => {
  loadProducts()
  loadRecipes()
})

async function loadProducts() {
  loading.value = true
  try {
    products.value = await pricedProductsService.list()
  } catch (err) {
    error.value = err.message || 'Erro ao carregar produtos.'
  } finally {
    loading.value = false
  }
}

async function loadRecipes() {
  try {
    availableRecipes.value = await recipesService.list()
  } catch (err) {
    console.warn('[PricingManager] Não foi possível carregar receitas.', err.message)
  }
}

function openProductModal(product = null) {
  editingProduct.value = product
  if (product) {
    form.value = {
      name: product.name,
      productType: product.productType,
      yieldSlices: product.yieldSlices,
      totalProductionCost: product.totalProductionCost,
      targetMarginPercent: product.targetMarginPercent,
      finalPrice: product.finalPrice,
      publishedToCatalog: product.publishedToCatalog,
      components: [],
    }
  } else {
    form.value = {
      name: '',
      productType: 'bolo_fatias',
      yieldSlices: null,
      totalProductionCost: 0,
      targetMarginPercent: 30,
      finalPrice: 0,
      publishedToCatalog: false,
      components: [],
    }
  }
  showProductModal.value = true
}

function closeProductModal() {
  showProductModal.value = false
  editingProduct.value = null
}

function addComponentRow() {
  if (!Array.isArray(form.components)) form.components = []
  form.components.push({
    recipeId: '',
    multiplierOrQty: 1,
    costContribution: 0,
  })
}

function removeComponent(idx) {
  form.components.splice(idx, 1)
  calcTotalCost()
}

function calcTotalCost() {
  let total = 0
  form.components.forEach((comp) => {
    const recipe = availableRecipes.value.find((r) => r.id === comp.recipeId)
    if (recipe) {
      comp.costContribution = comp.multiplierOrQty * recipe.unitCost
      total += comp.costContribution
    } else {
      comp.costContribution = 0
    }
  })
  form.totalProductionCost = total
}

function calcSuggestedPrice() {
  // Auto-calculate suggested price from margin
}

function calcMarginFromFinalPrice() {
  // Auto-calculate margin from final price
}

async function saveProduct() {
  if (!form.name) return

  savingProduct.value = true
  try {
    const payload = {
      name: form.name,
      productType: form.productType,
      yieldSlices: form.yieldSlices,
      totalProductionCost: productTotalCost.value,
      targetMarginPercent: form.targetMarginPercent,
      finalPrice: form.finalPrice,
      publishedToCatalog: form.publishedToCatalog,
    }

    let savedProduct
    if (editingProduct.value) {
      savedProduct = await pricedProductsService.update(editingProduct.value.id, payload)
    } else {
      savedProduct = await pricedProductsService.create(payload)
    }

    if (savedProduct) {
      // Remove old components
      const existing = await pricedProductComponentsService.listByProduct(savedProduct.id)
      for (const comp of existing) {
        await pricedProductComponentsService.remove(comp.id)
      }
      // Create new components
      for (const comp of form.components) {
        if (comp.recipeId) {
          await pricedProductComponentsService.create({
            pricedProductId: savedProduct.id,
            recipeId: comp.recipeId,
            multiplierOrQty: comp.multiplierOrQty,
          })
        }
      }
    }

    closeProductModal()
    await loadProducts()
  } catch (err) {
    toastError(err.message || 'Erro ao salvar produto.')
  } finally {
    savingProduct.value = false
  }
}

async function deleteProduct(id) {
  if (!confirm('Excluir este produto?')) return
  try {
    await pricedProductsService.remove(id)
    await loadProducts()
  } catch (err) {
    toastError(err.message || 'Erro ao excluir produto.')
  }
}

function productMarginNeedsReview(product) {
  const suggested = Number(product.suggestedPrice) || 0
  const finalPrice = Number(product.finalPrice) || 0
  const targetMargin = Number(product.targetMarginPercent) || 0
  const cost = Number(product.totalProductionCost) || 0

  if (!suggested || !finalPrice || !targetMargin) return false

  const realMargin = ((finalPrice - cost) / finalPrice) * 100
  const marginGap = targetMargin - realMargin

  // Alerta se: preço final abaixo do sugerido OU margem real mais de 3pp abaixo do alvo
  return finalPrice < suggested || marginGap > 3
}

async function applySuggestedPrice(product) {
  const suggested = Number(product.suggestedPrice) || 0
  if (!suggested || suggested <= 0) return

  try {
    await pricedProductsService.update(product.id, {
      name: product.name,
      productType: product.productType,
      yieldSlices: product.yieldSlices,
      totalProductionCost: product.totalProductionCost,
      targetMarginPercent: product.targetMarginPercent,
      finalPrice: suggested,
      publishedToCatalog: product.publishedToCatalog,
    })
    await loadProducts()
    success('Preço atualizado para o valor sugerido!')
  } catch (err) {
    toastError(err.message || 'Erro ao atualizar preço.')
  }
}
</script>