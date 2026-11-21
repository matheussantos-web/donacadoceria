<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-display font-medium text-2xl text-brand-text-primary">
          Estoque &amp; Insumos
        </h2>
        <p class="text-brand-text-muted">
          Cadastre, edite e dê baixa de insumos para calcular custos das receitas.
        </p>
      </div>
      <button
        @click="openIngredientModal()"
        class="btn-primary px-4 py-2 text-sm font-medium flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        Novo Insumo
      </button>
    </div>

    <!-- Alertas de estoque baixo -->
    <div
      v-if="lowStockIngredients.length > 0"
      class="bg-red-50 border border-red-100 rounded-xl p-4"
    >
      <h3 class="font-medium text-red-800 text-sm mb-2 flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          ></path>
        </svg>
        {{ lowStockIngredients.length }} item(s) abaixo do estoque mínimo
      </h3>
      <div class="overflow-x-auto mt-2">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-red-700 border-b border-red-200">
              <th class="pb-2">Insumo</th>
              <th class="pb-2 text-right">Estoque</th>
              <th class="pb-2 text-right">Mínimo</th>
              <th class="pb-2 text-right">Custo/un.</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-red-100">
            <tr v-for="item in lowStockIngredients" :key="item.id" class="text-red-700">
              <td class="pb-2 font-medium">{{ item.name }}</td>
              <td class="pb-2 text-right">{{ formatNumber(item.stockQuantity) }} {{ item.baseUnit }}</td>
              <td class="pb-2 text-right">{{ formatNumber(item.minStockAlert) }} {{ item.baseUnit }}</td>
              <td class="pb-2 text-right">R$ {{ formatPrice(item.costPerBaseUnit) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Lista de insumos -->
    <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
      <div class="flex gap-2 mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar insumo..."
          class="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
        />
        <select
          v-model="categoryFilter"
          class="px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
        >
          <option value="">Todas categorias</option>
          <option>Laticínios</option>
          <option>Chocolates</option>
          <option>Farinhas/Secos</option>
          <option>Frutas</option>
          <option>Embalagens</option>
          <option>Outros</option>
        </select>
        <button
          @click="openIngredientModal()"
          class="btn-secondary px-4 py-2 text-sm font-medium"
        >
          + Novo
        </button>
      </div>

      <div v-if="filteredIngredients.length === 0" class="text-center py-8 text-brand-text-muted">
        <p>Nenhum insumo cadastrado.</p>
        <button @click="openIngredientModal()" class="btn-primary mt-4 px-4 py-2">
          Cadastrar primeiro insumo
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in filteredIngredients"
          :key="item.id"
          class="bg-brand-bg border border-gray-200 rounded-lg p-4 flex flex-col"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-brand-text-primary">{{ item.name }}</h4>
            <span
              :class="[
                'px-2 py-1 rounded text-[10px] font-medium uppercase',
                item.stockQuantity <= item.minStockAlert
                  ? 'bg-red-50 text-red-700'
                  : 'bg-brand-primary/10 text-brand-primary',
              ]"
            >
              {{
                item.stockQuantity <= item.minStockAlert ? 'Estoque Baixo' : 'OK'
              }}
            </span>
          </div>
          <p class="text-xs text-brand-text-muted mb-3">
            {{ item.brand }} · {{ item.category }}
          </p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-brand-text-muted">Custo/unidade:</span>
              <span class="font-medium text-brand-text-primary">
                R$ {{ formatPrice(item.costPerBaseUnit) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-brand-text-muted">Estoque:</span>
              <span class="font-medium">
                {{ formatNumber(item.stockQuantity) }} {{ item.baseUnit }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-brand-text-muted">Pacote:</span>
              <span class="font-medium">
                {{ formatNumber(item.packageSize) }} {{ item.purchaseUnit }}
              </span>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            <button
              @click="openIngredientModal(item)"
              class="flex-1 btn-secondary py-1.5 text-xs font-medium"
            >
              Editar
            </button>
            <button
              @click="deleteIngredient(item.id)"
              class="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de cadastro/edição de insumo -->
    <div
      v-if="showIngredientModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm"
      @click.self="closeIngredientModal"
    >
      <div
        class="w-full max-w-lg max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden bg-brand-surface border border-gray-100"
        @click.stop
      >
        <!-- Cabeçalho fixo -->
        <div class="shrink-0 border-b p-4 sm:p-6 border-gray-100 flex items-center justify-between bg-brand-surface">
          <h3 class="font-display font-medium text-lg text-brand-text-primary">
            {{ editingIngredient ? 'Editar Insumo' : 'Novo Insumo' }}
          </h3>
          <button
            @click="closeIngredientModal"
            class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
            aria-label="Fechar"
          >
            <span class="text-2xl">✕</span>
          </button>
        </div>

        <!-- Corpo rolável -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-brand-surface">
          <form id="ingredient-form" @submit.prevent="saveIngredient" class="space-y-5">
            <!-- Nome -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Nome do insumo
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <!-- Marca -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Marca (opcional)
              </label>
              <input
                v-model="form.brand"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <!-- Categoria -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Categoria
              </label>
              <select
                v-model="form.category"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              >
                <option value="Laticínios">Laticínios</option>
                <option value="Chocolates">Chocolates</option>
                <option value="Farinhas/Secos">Farinhas/Secos</option>
                <option value="Frutas">Frutas</option>
                <option value="Embalagens">Embalagens</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <!-- Como você compra este item? -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Como você compra este item?
              </label>
              <p class="text-xs text-brand-text-muted mb-2">
                Ex: Caixa, Pacote, Lata, Frasco, Unidade, Kg, Litro
              </p>
              <select
                v-model="form.purchaseUnit"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              >
                <option value="cx">Caixa</option>
                <option value="kg">Kg</option>
                <option value="l">Litro</option>
                <option value="un">Unidade</option>
              </select>
            </div>

            <!-- Quanto vem dentro de 1 embalagem? -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Quanto vem dentro de 1 embalagem?
              </label>
              <input
                v-model.number="form.packageSize"
                type="number"
                step="0.01"
                min="0.01"
                required
                :placeholder="packageSizePlaceholder"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
              <p class="text-xs text-brand-text-muted mt-1">
                Ex: {{ packageSizePlaceholder }} {{ form.baseUnit }}
              </p>
            </div>

            <!-- Unidade usada nas receitas -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Unidade usada nas receitas
              </label>
              <select
                v-model="form.baseUnit"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              >
                <option value="g">Grama (g)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>

            <!-- Quanto custa 1 embalagem? -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Quanto custa 1 embalagem? (R$)
              </label>
              <input
                v-model.number="form.lastUnitCost"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <!-- Estoque atual (embalagens + total na unidade base) -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p class="text-xs font-medium text-brand-text-muted mb-3 uppercase tracking-wider">
                Estoque atual
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-brand-text-muted mb-1">
                    Embalagens fechadas
                  </label>
                  <input
                    v-model.number="form.stockPackages"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-brand-text-muted mb-1">
                    Total em {{ form.baseUnit }}
                  </label>
                  <input
                    v-model.number="form.stockQuantity"
                    type="number"
                    step="0.01"
                    min="0"
                    readonly
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <!-- Estoque mínimo -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Estoque mínimo para alerta ({{ form.baseUnit }})
              </label>
              <input
                v-model.number="form.minStockAlert"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <!-- Resumo de custo em tempo real -->
            <div class="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 mb-2">
              <p class="text-xs font-medium text-brand-text-muted mb-3 uppercase tracking-wider">
                Resumo antes de salvar
              </p>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-brand-text-muted">Custo por embalagem:</span>
                  <span class="font-medium text-brand-text-primary">
                    {{ costPerPackage }} ({{ purchaseUnitLabel }} com {{ formatNumber(form.packageSize) }}{{ form.baseUnit }})
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-brand-text-muted">Custo para receitas:</span>
                  <span class="font-medium text-brand-text-primary">
                    {{ costPerBaseUnit }} por {{ form.baseUnit }}
                  </span>
                </div>
                <div class="flex justify-between border-t border-gray-200 pt-2">
                  <span class="text-brand-text-muted">Estoque total:</span>
                  <span class="font-medium">
                    {{ formatNumber(form.stockQuantity) }}{{ form.baseUnit }} (
                    {{ formatNumber(form.stockPackages) }} {{ purchaseUnitLabel }}
                    )
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Rodapé fixo -->
        <div class="shrink-0 border-t p-4 sm:p-6 border-gray-100 bg-brand-surface flex items-center justify-end gap-3">
          <button
            type="button"
            @click="closeIngredientModal"
            class="px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="ingredient-form"
            :disabled="savingIngredient"
            class="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
          >
            {{ savingIngredient ? 'Salvando...' : editingIngredient ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ingredientsService } from '@/services/ingredients'

const props = defineProps({})
const emit = defineEmits([])

const ingredients = ref([])
const loading = ref(false)
const error = ref('')

// Modal state
const showIngredientModal = ref(false)
const editingIngredient = ref(null)
const savingIngredient = ref(false)

const form = ref({
  name: '',
  brand: '',
  category: 'Outros',
  purchaseUnit: 'cx',
  packageSize: 1,
  baseUnit: 'g',
  lastUnitCost: 0,
  stockQuantity: 0,
  stockPackages: 0,
  minStockAlert: 0,
})

// Search / filter
const searchQuery = ref('')
const categoryFilter = ref('')

const filteredIngredients = computed(() => {
  return ingredients.value.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesCategory = !categoryFilter.value || item.category === categoryFilter.value
    return matchesSearch && matchesCategory
  })
})

const lowStockIngredients = computed(() =>
  ingredients.value.filter((i) => i.stockQuantity <= i.minStockAlert)
)

const formatPrice = (price) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)

const formatNumber = (num) => Number(num).toLocaleString('pt-BR')

// Label amigável da unidade de compra
const purchaseUnitLabels = { cx: 'Caixa', kg: 'Kg', l: 'Litro', un: 'Unidade' }
const purchaseUnitLabel = computed(() => purchaseUnitLabels[form.value.purchaseUnit] || form.value.purchaseUnit)

// Placeholder dinâmico do tamanho da embalagem conforme a unidade base
const packageSizePlaceholder = computed(() => {
  switch (form.value.baseUnit) {
    case 'g': return '395'
    case 'ml': return '1000'
    case 'un': return '12'
    default: return '0'
  }
})

// Custo por embalagem (valor pago na compra)
const costPerPackage = computed(() => formatPrice(form.value.lastUnitCost))

// Custo por unidade base (para uso nas receitas)
const costPerBaseUnit = computed(() => {
  const ps = Number(form.value.packageSize) || 1
  return formatPrice(form.value.lastUnitCost / ps)
})

// Sincronização automática: estoque em embalagens <-> estoque total na unidade base
watch(() => form.value.stockPackages, (v) => {
  const ps = Number(form.value.packageSize) || 1
  form.value.stockQuantity = Math.max(0, Number(v) * ps)
})

watch(() => form.value.stockQuantity, (v) => {
  const ps = Number(form.value.packageSize) || 1
  form.value.stockPackages = ps > 0 ? Math.max(0, Number((Number(v) / ps).toFixed(2))) : 0
})

onMounted(() => {
  loadIngredients()
})

async function loadIngredients() {
  loading.value = true
  try {
    ingredients.value = await ingredientsService.list()
  } catch (err) {
    error.value = err.message || 'Erro ao carregar insumos.'
  } finally {
    loading.value = false
  }
}

function openIngredientModal(item = null) {
  editingIngredient.value = item
  if (item) {
    form.value = {
      name: item.name,
      brand: item.brand || '',
      category: item.category,
      purchaseUnit: item.purchaseUnit,
      packageSize: item.packageSize,
      baseUnit: item.baseUnit,
      lastUnitCost: item.lastUnitCost,
      stockQuantity: item.stockQuantity,
      stockPackages: item.packageSize > 0 ? item.stockQuantity / item.packageSize : 0,
      minStockAlert: item.minStockAlert,
    }
  } else {
    form.value = {
      name: '',
      brand: '',
      category: 'Outros',
      purchaseUnit: 'cx',
      packageSize: 1,
      baseUnit: 'g',
      lastUnitCost: 0,
      stockQuantity: 0,
      stockPackages: 0,
      minStockAlert: 0,
    }
  }
  showIngredientModal.value = true
}

function closeIngredientModal() {
  showIngredientModal.value = false
  editingIngredient.value = null
}

async function saveIngredient() {
  if (!form.value.name || form.value.packageSize <= 0 || form.value.lastUnitCost < 0) return

  savingIngredient.value = true
  try {
    // Garante consistência: estoque em embalagens * tamanho = total na unidade base
    form.value.stockQuantity = Math.max(0, Number(form.value.stockPackages) * Number(form.value.packageSize))

    const payload = {
      name: form.value.name,
      brand: form.value.brand,
      category: form.value.category,
      purchaseUnit: form.value.purchaseUnit,
      packageSize: form.value.packageSize,
      baseUnit: form.value.baseUnit,
      lastUnitCost: form.value.lastUnitCost,
      stockQuantity: form.value.stockQuantity,
      minStockAlert: form.value.minStockAlert,
    }

    if (editingIngredient.value) {
      await ingredientsService.update(editingIngredient.value.id, payload)
    } else {
      await ingredientsService.create(payload)
    }

    closeIngredientModal()
    await loadIngredients()
  } catch (err) {
    alert(err.message || 'Erro ao salvar insumo.')
  } finally {
    savingIngredient.value = false
  }
}

async function deleteIngredient(id) {
  if (!confirm('Excluir este insumo?')) return
  try {
    await ingredientsService.remove(id)
    await loadIngredients()
  } catch (err) {
    alert(err.message || 'Erro ao excluir insumo.')
  }
}
</script>