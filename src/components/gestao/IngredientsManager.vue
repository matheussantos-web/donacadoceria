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
        <Plus class="w-4 h-4" />
        Novo Insumo
      </button>
    </div>

    <!-- Alertas de estoque baixo -->
    <div
      v-if="lowStockIngredients.length > 0"
      class="bg-red-50 border border-red-100 rounded-xl p-4"
    >
      <h3 class="font-medium text-red-800 text-sm mb-2 flex items-center gap-2">
        <AlertTriangle class="w-5 h-5 text-red-600" />
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

      <div v-if="filteredIngredients.length === 0" class="text-center py-12 text-brand-text-muted">
        <p class="text-sm mb-4">Nenhum insumo cadastrado ainda.</p>
        <p class="text-xs text-brand-text-muted mb-6">Cadastre seus insumos para começar a calcular o custo das receitas.</p>
        <button @click="openIngredientModal()" class="btn-primary px-6 py-2.5 text-sm font-medium">
          <Plus class="w-4 h-4 mr-2" /> Cadastrar primeiro insumo
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
                {{ formatNumber(item.stockQuantity) }} {{ item.baseUnit }} ({{ Math.floor(Number(item.stockQuantity) / Number(item.packageSize || 1)) }} cx)
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-brand-text-muted">Pacote:</span>
              <span class="font-medium">
                {{ formatNumber(item.packageSize) }} {{ item.purchaseUnit }}
              </span>
            </div>
          </div>
          <!-- Barra de nível de estoque -->
          <div class="mt-3 mb-2">
            <div class="flex items-center gap-1 mb-1">
              <span class="text-[10px] font-medium text-brand-text-muted">Nível de Estoque</span>
              <span class="text-[10px] font-medium"
                :class="
                  item.stockQuantity <= item.minStockAlert
                    ? 'text-red-600'
                    : item.stockQuantity <= item.minStockAlert * 1.5
                    ? 'text-amber-600'
                    : 'text-brand-primary'
                "
              >
                {{ stockLevelLabel(item) }}
              </span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="
                  item.stockQuantity <= 0
                    ? 'bg-red-500 animate-pulse'
                    : (!item.minStockAlert || item.minStockAlert <= 0)
                    ? 'bg-emerald-500'
                    : item.stockQuantity <= item.minStockAlert
                    ? 'bg-red-500 animate-pulse'
                    : item.stockQuantity <= item.minStockAlert * 1.5
                    ? 'bg-amber-500'
                    : 'bg-brand-primary'
                "
                :style="{ width: stockPercentage(item) + '%' }"
              ></div>
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
              @click="openStockExtract(item)"
              class="flex-1 btn-secondary py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/10"
            >
              Extrato
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
            <X class="w-5 h-5" />
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
                    {{ costPerPackage }} ({{ purchaseUnitLabel }} com {{ formatNumber(form.packageSize) }} {{ form.baseUnit }})
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
                    {{ formatNumber(form.stockQuantity) }} {{ form.baseUnit }} (
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

  <!-- Modal de Extrato e Ajuste Manual de Estoque -->
  <div
    v-if="showStockExtractModal"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm"
    @click.self="closeStockExtractModal"
  >
    <div
      class="w-full max-w-md max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden bg-brand-surface border border-gray-100"
      @click.stop
    >
      <!-- Cabeçalho fixo -->
      <div class="shrink-0 border-b p-4 sm:p-6 border-gray-100 flex items-center justify-between bg-brand-surface">
        <div>
          <h3 class="font-display font-medium text-lg text-brand-text-primary">
            Extrato de Estoque
          </h3>
          <p class="text-xs text-brand-text-muted mt-1">
            {{ extractIngredient?.name }}
          </p>
        </div>
        <button
          @click="closeStockExtractModal"
          class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
          aria-label="Fechar"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Corpo rolável -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-brand-surface">
        <!-- Saldo atual -->
        <div class="bg-brand-bg border border-gray-100 rounded-xl p-4 mb-4">
          <p class="text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-2">
            Saldo atual
          </p>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-brand-text-muted text-xs">Embalagens fechadas</p>
              <p class="font-medium text-brand-text-primary text-lg">
                {{ formatNumber(extractIngredient?.stockPackages || 0) }}
                {{ purchaseUnitLabels[extractIngredient?.purchaseUnit] || extractIngredient?.purchaseUnit }}
              </p>
            </div>
            <div>
              <p class="text-brand-text-muted text-xs">Total em {{ extractIngredient?.baseUnit }}</p>
              <p class="font-medium text-brand-text-primary text-lg">
                {{ formatNumber(extractIngredient?.stockQuantity || 0) }}
                {{ extractIngredient?.baseUnit }}
              </p>
            </div>
          </div>
        </div>

        <!-- Movimentações -->
        <div class="mb-4">
          <p class="text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-3">
            Movimentações
          </p>
          <div v-if="extractMovements.length === 0" class="text-center py-4 text-brand-text-muted text-sm">
            Nenhuma movimentação registrada.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="mov in extractMovements"
              :key="mov.id"
              class="flex items-center justify-between p-2 bg-brand-bg/50 rounded border border-gray-100"
            >
              <div class="flex items-center gap-2 flex-1">
                <span
                  class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                  :class="
                    mov.movementType === 'entrada'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  "
                >
                  {{ mov.movementType === 'entrada' ? '+ Entrada' : '- Saída' }}
                </span>
                <span class="text-sm text-brand-text-primary">{{ formatNumber(mov.quantity) }}</span>
              </div>
              <div class="flex flex-col sm:flex-row gap-2 text-xs text-brand-text-muted">
                <span>{{ mov.reason }}</span>
                <span>{{ new Date(mov.createdAt).toLocaleString('pt-BR') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ajuste manual -->
        <div class="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4">
          <p class="text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-3">
            Ajuste manual de estoque
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-brand-text-muted mb-1">
                Tipo
              </label>
              <select
                v-model="adjustmentForm.movementType"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-brand-text-muted mb-1">
                Quantidade ({{ extractIngredient?.baseUnit }})
              </label>
              <input
                v-model.number="adjustmentForm.quantity"
                type="number"
                step="0.01"
                min="0.01"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-brand-text-muted mb-1">
                Motivo
              </label>
              <input
                v-model="adjustmentForm.reason"
                type="text"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
              />
            </div>
          </div>
          <div class="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              @click="saveStockAdjustment"
              :disabled="savingAdjustment || !adjustmentForm.quantity"
              class="btn-primary px-4 py-2 text-xs font-medium disabled:opacity-50 disabled:pointer-events-none"
            >
              {{ savingAdjustment ? 'Ajustando...' : 'Aplicar ajuste' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Rodapé fixo -->
      <div class="shrink-0 border-t p-4 sm:p-6 border-gray-100 bg-brand-surface flex items-center justify-end">
        <button
          @click="closeStockExtractModal"
          class="px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ingredientsService } from '@/services/ingredients'
import { stockMovementsService } from '@/services/stockMovements'
import { useToast } from '@/composables/useToast'
import { Plus, AlertTriangle, X } from 'lucide-vue-next'

const props = defineProps({})
const emit = defineEmits([])

const { toast, toasts, success, error: toastError, warning, info, dismiss: dismissToast } = useToast()

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

// Modal de extrato / ajuste manual de estoque
const showStockExtractModal = ref(false)
const extractIngredient = ref(null)
const extractMovements = ref([])
const savingAdjustment = ref(false)
const adjustmentForm = ref({
  movementType: 'entrada',
  quantity: 0,
  reason: 'Ajuste manual de estoque',
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

// Nível de estoque percentual para barra visual
const stockPercentage = (item) => {
  if (!item) return 0
  const qty = Number(item.stockQuantity) || 0
  const min = Number(item.minStockAlert) || 0
  if (qty <= 0) return 0
  if (min <= 0) return 100
  return Math.min(100, Math.round((qty / (min * 2)) * 100))
}

const stockLevelLabel = (item) => {
  if (!item) return 'Crítico'
  const qty = Number(item.stockQuantity) || 0
  const min = Number(item.minStockAlert) || 0
  if (qty <= 0) return 'Crítico'
  if (min <= 0) return 'Estoque OK'
  if (qty <= min) return 'Crítico'
  if (qty <= min * 1.5) return 'Atenção'
  return 'OK'
}

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
    toastError(err.message || 'Erro ao salvar insumo.')
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
    toastError(err.message || 'Erro ao excluir insumo.')
  }
}

async function openStockExtract(item) {
  extractIngredient.value = item
  adjustmentForm.value = { movementType: 'entrada', quantity: 0, reason: 'Ajuste manual de estoque' }
  try {
    extractMovements.value = await stockMovementsService.listByIngredient(item.id)
  } catch (err) {
    console.warn('[IngredientsManager] Não foi carregar extrato.', err.message)
    extractMovements.value = []
  }
  showStockExtractModal.value = true
}

function closeStockExtractModal() {
  showStockExtractModal.value = false
  extractIngredient.value = null
  extractMovements.value = []
}

async function saveStockAdjustment() {
  if (!extractIngredient.value) return
  if (!adjustmentForm.quantity || adjustmentForm.quantity <= 0) return

  savingAdjustment.value = true
  try {
    await stockMovementsService.createManualAdjustment({
      ingredientId: extractIngredient.value.id,
      movementType: adjustmentForm.movementType,
      quantity: adjustmentForm.quantity,
      reason: adjustmentForm.reason || 'Ajuste manual de estoque',
    })

    // Atualiza o saldo local do insumo na lista
    const idx = ingredients.value.findIndex((i) => i.id === extractIngredient.value.id)
    if (idx !== -1) {
      const current = Number(ingredients.value[idx].stockQuantity) || 0
      const change = adjustmentForm.movementType === 'entrada'
        ? Number(adjustmentForm.quantity)
        : -Number(adjustmentForm.quantity)
      ingredients.value[idx].stockQuantity = Math.max(0, current + change)
      ingredients.value[idx].stockPackages =
        ingredients.value[idx].packageSize > 0
          ? Math.max(0, Number((ingredients.value[idx].stockQuantity / ingredients.value[idx].packageSize).toFixed(2)))
          : 0
    }

    closeStockExtractModal()
    await loadIngredients()
  } catch (err) {
    toastError(err.message || 'Erro ao ajustar estoque.')
  } finally {
    savingAdjustment.value = false
  }
}
</script>