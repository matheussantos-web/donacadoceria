<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-display font-medium text-2xl text-brand-text-primary">
          Receitas &amp; Fichas Técnicas
        </h2>
        <p class="text-brand-text-muted">
          Construa receitas base adicionando insumos. O custo total e unitário são calculados automaticamente.
        </p>
      </div>
      <button
        @click="openRecipeModal()"
        class="btn-primary px-4 py-2 text-sm font-medium flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        Nova Receita
      </button>
    </div>

    <!-- Lista de receitas -->
    <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
      <div v-if="recipes.length === 0" class="text-center py-12 text-brand-text-muted">
        <p class="text-sm mb-4">Nenhuma receita cadastrada ainda.</p>
        <p class="text-xs text-brand-text-muted mb-6">Cadastre suas receitas para calcular o custo de cada preparo.</p>
        <button @click="openRecipeModal()" class="btn-primary px-6 py-2.5 text-sm font-medium">
          <Plus class="w-4 h-4 mr-2" /> Cadastrar primeira receita
        </button>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="recipe in recipes"
          :key="recipe.id"
          class="bg-brand-bg border border-gray-200 rounded-lg p-4 flex flex-col"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-brand-text-primary">{{ recipe.name }}</h4>
            <span
              class="px-2 py-1 rounded text-[10px] font-medium uppercase text-brand-text-muted bg-brand-bg/50"
            >
              {{ recipe.category }}
            </span>
          </div>
          <p class="text-xs text-brand-text-muted mb-3">
            Rendimento: {{ formatNumber(recipe.yieldQuantity) }} {{ recipe.yieldUnit }}
          </p>
          <div class="space-y-1 text-sm mb-3">
            <div class="flex justify-between">
              <span class="text-brand-text-muted">Custo total:</span>
              <span class="font-medium text-brand-text-primary">
                R$ {{ formatPrice(recipe.totalCost) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-brand-text-muted">Custo/unidade:</span>
              <span class="font-medium text-brand-text-primary">
                R$ {{ formatPrice(recipe.unitCost) }}
              </span>
            </div>
          </div>
          <div class="mt-auto pt-3 border-t border-gray-100 flex gap-2">
            <button
              @click="openRecipeModal(recipe)"
              class="flex-1 btn-secondary py-1.5 text-xs font-medium"
            >
              Editar
            </button>
            <button
              @click="deleteRecipe(recipe.id)"
              class="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de receita com construtor de ingredientes -->
    <div
      v-if="showRecipeModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm"
      @click.self="closeRecipeModal"
    >
      <div
        class="w-full max-w-lg max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden bg-brand-surface border border-gray-100"
        @click.stop
      >
        <!-- Cabeçalho fixo -->
        <div class="shrink-0 border-b p-4 sm:p-6 border-gray-100 flex items-center justify-between bg-brand-surface">
          <h3 class="font-display font-medium text-lg text-brand-text-primary">
            {{ editingRecipe ? 'Editar Receita' : 'Nova Receita' }}
          </h3>
          <button
            @click="closeRecipeModal"
            class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
            aria-label="Fechar"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Corpo rolável -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-brand-surface">
          <form id="recipe-form" @submit.prevent="saveRecipe" class="space-y-6">
            <!-- Nome e categoria -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-brand-text-muted mb-1">
                  Nome da receita
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
                  Categoria
                </label>
                <select
                  v-model="form.category"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                >
                  <option value="Massas">Massas</option>
                  <option value="Recheios">Recheios</option>
                  <option value="Coberturas">Coberturas</option>
                  <option value="Doces">Doces</option>
                  <option value="Sobremesas">Sobremesas</option>
                  <option value="Embalagens">Embalagens</option>
                </select>
              </div>
            </div>

            <!-- Rendimento -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-brand-text-muted mb-1">
                  Quantidade do rendimento
                </label>
                <input
                  v-model.number="form.yieldQuantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-text-muted mb-1">
                  Unidade do rendimento
                </label>
                <select
                  v-model="form.yieldUnit"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                >
                  <option value="g">Grama (g)</option>
                  <option value="un">Unidade (un)</option>
                  <option value="fatias">Fatias</option>
                </select>
              </div>
            </div>

            <!-- Custos indiretos -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-brand-text-muted mb-1">
                  Custos indiretos (%) — gás, energia, perdas
                </label>
                <input
                  v-model.number="form.overheadPercent"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-text-muted mb-1">
                  Mão de obra (R$)
                </label>
                <input
                  v-model.number="form.laborCost"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>
            </div>

            <!-- Observações -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Observações
              </label>
              <textarea
                v-model="form.notes"
                rows="2"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <!-- Ingredientes da receita -->
            <div class="pt-4 border-t border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-brand-text-primary">Ingredientes</h4>
                <button
                  type="button"
                  @click="addIngredientRow()"
                  class="text-xs text-brand-primary underline hover:text-brand-accent"
                >
                  + Adicionar insumo
                </button>
              </div>

              <div
                v-for="(ing, idx) in form.recipeIngredients"
                :key="idx"
                class="flex gap-2 items-end mb-2 bg-brand-bg/50 p-3 rounded border border-gray-100"
              >
                <!-- Insumo -->
                <select
                  v-model="ing.ingredientId"
                  @change="onIngredientChange(ing)"
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
                >
                  <option value="">Selecionar insumo...</option>
                  <option
                    v-for="ingredient in availableIngredients"
                    :key="ingredient.id"
                    :value="ingredient.id"
                  >
                    {{ ingredient.name }} ({{ formatPrice(ingredient.costPerBaseUnit) }}/{{ ingredient.baseUnit }})
                  </option>
                </select>

                <!-- Quantidade -->
                <input
                  v-model.number="ing.quantityUsed"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Qtd"
                  @input="calcTotalCost()"
                  class="w-24 px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm text-right"
                />

                <!-- Unidade (embalagem/cx ou medida g/ml/kg/l) -->
                <select
                  v-model="ing.unit"
                  class="px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
                  @change="calcTotalCost()"
                >
                  <option value="package">{{ getPurchaseUnit(ing) }}</option>
                  <option value="base">{{ getBaseUnit(ing) }}</option>
                </select>

                <!-- Custo do item -->
                <span class="w-20 text-xs text-brand-text-muted text-right">
                  {{ ing.ingredientId ? formatPrice(ing.costContribution || 0) : '—' }}
                </span>

                <!-- Remover -->
                <button
                  type="button"
                  @click="removeIngredientRow(idx)"
                  class="text-red-600 hover:text-red-800 text-xs"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>

              <div v-if="form.recipeIngredients.length === 0" class="text-brand-text-muted text-xs mt-2">
                Nenhum insumo adicionado ainda.
              </div>

              <!-- Custo total calculado -->
              <div class="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 mt-4">
                <p class="text-xs font-medium text-brand-text-muted mb-3 uppercase tracking-wider">Resumo de custo</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-brand-text-muted">Custo total da receita:</span>
                    <span class="font-medium text-brand-text-primary tabular-nums">{{ formatPrice(recipeTotalCost) }}</span>
                  </div>
                  <div class="flex justify-between border-t border-gray-200 pt-2">
                    <span class="text-brand-text-muted">Custo por unidade de rendimento:</span>
                    <span class="font-medium text-brand-text-primary tabular-nums">
                      {{ formatPrice(recipeTotalCost / Math.max(1, Number(form.yieldQuantity || 1))) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Rodapé fixo -->
        <div class="shrink-0 border-t p-4 sm:p-6 border-gray-100 bg-brand-surface flex items-center justify-end gap-3">
          <button
            type="button"
            @click="closeRecipeModal"
            class="px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="recipe-form"
            :disabled="savingRecipe"
            class="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
          >
            {{ savingRecipe ? 'Salvando...' : editingRecipe ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { recipesService, recipeIngredientsService } from '@/services/recipes'
import { ingredientsService } from '@/services/ingredients'
import { Plus, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const props = defineProps({})
const emit = defineEmits([])

// State
const recipes = ref([])
const availableIngredients = ref([])
const loading = ref(false)
const error = ref('')

// Modal state
const showRecipeModal = ref(false)
const editingRecipe = ref(null)
const savingRecipe = ref(false)

const { warning: toastWarning } = useToast()

const form = ref({
  name: '',
  category: 'Massas',
  yieldQuantity: 1,
  yieldUnit: 'g',
  overheadPercent: 15,
  laborCost: 0,
  totalCost: 0,
  notes: '',
  recipeIngredients: [],
})

watch(
  () => form.recipeIngredients,
  () => {
    calcTotalCost()
  },
  { deep: true }
)

const recipeTotalCost = computed(() => form.totalCost)

const formatPrice = (price) => {
  if (price == null || Number.isNaN(Number(price))) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(price))
}

const formatNumber = (num) => {
  if (num == null || Number.isNaN(Number(num))) return '0'
  return Number(num).toLocaleString('pt-BR')
}

onMounted(() => {
  loadRecipes()
  loadIngredients()
})

async function loadRecipes() {
  loading.value = true
  try {
    recipes.value = await recipesService.list()
  } catch (err) {
    error.value = err.message || 'Erro ao carregar receitas.'
  } finally {
    loading.value = false
  }
}

async function loadIngredients() {
  try {
    availableIngredients.value = await ingredientsService.list()
  } catch (err) {
    console.warn('[RecipesManager] Não foi possível carregar insumos.', err.message)
  }
}

async function openRecipeModal(recipe = null) {
  editingRecipe.value = recipe
  if (recipe) {
    form.value = {
      name: recipe.name,
      category: recipe.category,
      yieldQuantity: recipe.yieldQuantity,
      yieldUnit: recipe.yieldUnit,
      overheadPercent: recipe.overheadPercent,
      laborCost: recipe.laborCost,
      totalCost: recipe.totalCost,
      notes: recipe.notes || '',
      recipeIngredients: [],
    }
    // Carregar ingredientes vinculados à receita ao abrir edição
    try {
      const items = await recipeIngredientsService.listByRecipe(recipe.id)
      form.value.recipeIngredients = items.map((item) => ({
        id: item.id,
        ingredientId: item.ingredientId,
        quantityUsed: item.quantityUsed,
        unit: 'base',
        costContribution: 0,
      }))
      calcTotalCost()
    } catch (err) {
      console.warn('[RecipesManager] Não foi possível carregar ingredientes da receita.', err.message)
    }
  } else {
    form.value = {
      name: '',
      category: 'Massas',
      yieldQuantity: 1,
      yieldUnit: 'g',
      overheadPercent: 15,
      laborCost: 0,
      totalCost: 0,
      notes: '',
      recipeIngredients: [],
    }
  }
  showRecipeModal.value = true
}

function closeRecipeModal() {
  showRecipeModal.value = false
  editingRecipe.value = null
}

function onIngredientChange(ing) {
  ing.quantityUsed = 0
  ing.unit = 'base'
  ing.costContribution = 0
  calcTotalCost()
}

function addIngredientRow() {
  if (availableIngredients.value.length === 0) {
    toastWarning("Cadastre ao menos um insumo no estoque antes de adicionar à receita.", { duration: 4000 })
    return
  }
  if (!Array.isArray(form.value.recipeIngredients)) form.value.recipeIngredients = []
  form.value.recipeIngredients.push({
    ingredientId: '',
    quantityUsed: 0,
    unit: 'base',
    costContribution: 0,
  })
}

function removeIngredientRow(idx) {
  form.value.recipeIngredients.splice(idx, 1)
  calcTotalCost()
}

function round2(v) {
  return Math.round(v * 100) / 100
}

function getIngredient(ing) {
  return availableIngredients.value.find((i) => i.id === ing.ingredientId) || null
}

function getPurchaseUnit(ing) {
  const ingredient = getIngredient(ing)
  return ingredient ? (ingredient.purchaseUnit || 'un') : 'un'
}

function getBaseUnit(ing) {
  const ingredient = getIngredient(ing)
  return ingredient ? (ingredient.baseUnit || 'g') : 'g'
}

// Custo por unidade selecionada (embalagem/cx ou medida g/ml/kg/l)
function getUnitCost(ing) {
  const ingredient = getIngredient(ing)
  if (!ingredient) return 0
  if (ing.unit === 'package') {
    // custo da embalagem inteira (cx / un / pct)
    return Number(ingredient.lastUnitCost) || 0
  }
  // unidade de medida base: custo por g/ml (kg -> 1000g, l -> 1000ml)
  let cost = Number(ingredient.costPerBaseUnit) || 0
  if (ingredient.baseUnit === 'kg') cost = cost / 1000
  if (ingredient.baseUnit === 'l') cost = cost / 1000
  return cost
}

function calcLineCost(ing) {
  const ingredient = getIngredient(ing)
  if (!ingredient || !ing.ingredientId) {
    ing.costContribution = 0
    return 0
  }
  const newContribution = round2(Number(ing.quantityUsed || 0) * getUnitCost(ing))
  if (ing.costContribution !== newContribution) ing.costContribution = newContribution
  return ing.costContribution
}

function calcTotalCost() {
  let total = 0
  form.value.recipeIngredients.forEach((ing) => {
    total += calcLineCost(ing)
  })

  const overhead = (total * Number(form.value.overheadPercent || 0)) / 100
  const labor = Number(form.value.laborCost || 0)
  form.value.totalCost = round2(total + overhead + labor)
}

async function saveRecipe() {
  if (!form.value.name || form.value.yieldQuantity <= 0) return

  savingRecipe.value = true
  try {
    const payload = {
      name: form.value.name,
      category: form.value.category,
      yieldQuantity: form.value.yieldQuantity,
      yieldUnit: form.value.yieldUnit,
      overheadPercent: form.value.overheadPercent,
      laborCost: form.value.laborCost,
      totalCost: form.value.totalCost,
      notes: form.value.notes,
    }

    let savedRecipe
    if (editingRecipe.value) {
      savedRecipe = await recipesService.update(editingRecipe.value.id, payload)
    } else {
      savedRecipe = await recipesService.create(payload)
    }

    // Salvar ingredientes da receita
    if (savedRecipe) {
      // Remover ingredientes antigos e recriar (simplificado)
      // Em produção, ideal seria fazer diff
      const existing = await recipeIngredientsService.listByRecipe(savedRecipe.id)
      for (const oldIng of existing) {
        await recipeIngredientsService.remove(oldIng.id)
      }
      for (const ing of form.value.recipeIngredients) {
        if (ing.ingredientId && ing.quantityUsed > 0) {
          await recipeIngredientsService.create({
            recipeId: savedRecipe.id,
            ingredientId: ing.ingredientId,
            quantityUsed: ing.quantityUsed,
          })
        }
      }
    }

    closeRecipeModal()
    await loadRecipes()
  } catch (err) {
    alert(err.message || 'Erro ao salvar receita.')
  } finally {
    savingRecipe.value = false
  }
}

async function deleteRecipe(id) {
  if (!confirm('Excluir esta receita?')) return
  try {
    await recipesService.remove(id)
    await loadRecipes()
  } catch (err) {
    alert(err.message || 'Erro ao excluir receita.')
  }
}
</script>