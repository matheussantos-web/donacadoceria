<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-black/70 backdrop-blur-sm"
    @click.self="closeModal"
  >
    <div
      class="w-full max-w-lg max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden bg-brand-surface border border-gray-100"
      @click.stop
    >
      <!-- Cabeçalho fixo -->
      <div class="shrink-0 border-b p-4 sm:p-6 border-gray-100 flex items-center justify-between bg-brand-surface">
        <div>
          <h3 class="font-display font-medium text-lg text-brand-text-primary">
            Conciliação de Nota Fiscal
          </h3>
          <p class="text-sm text-brand-text-muted mt-1">
            {{ nfce.storeName }} · {{ formatDateBR(nfce.issueDate) }} · Total {{ formatPrice(nfce.totalAmount) }}
          </p>
        </div>
        <button
          @click="closeModal"
          class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
          aria-label="Fechar"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Corpo rolável -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-brand-surface">
        <!-- Contador resumido -->
        <div class="bg-brand-bg border border-gray-100 rounded-lg p-3 mb-4 flex items-center justify-between text-sm">
          <span class="text-brand-text-muted flex items-center gap-2">
            <span class="text-brand-primary font-medium">{{ linkedCount }}</span> vinculados ·
            <span class="text-brand-primary font-medium">{{ newCount }}</span> novos insumos ·
            <span class="text-brand-text-muted font-medium">{{ ignoredCount }}</span> ignorados
          </span>
        </div>

        <!-- Barra de Ações em Lote -->
        <div class="bg-brand-bg border border-gray-100 rounded-lg p-3 mb-4">
          <div class="text-xs text-brand-text-muted font-medium uppercase tracking-wider mb-3">
            Ações em lote
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              @click="batchLinkAllNew"
              :disabled="noUnlinkedItems"
              class="btn-primary py-2 text-sm font-medium text-center"
            >
              Cadastrar novos como insumos
            </button>
            <button
              @click="batchIgnoreAllUnlinked"
              :disabled="noUnlinkedItems"
              class="py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded border border-gray-200 text-center"
            >
              Ignorar sem vínculo
            </button>
            <button
              @click="resetSuggestions"
              class="px-3 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded border border-gray-200 text-center"
            >
              Resetar sugestões
            </button>
          </div>
        </div>

        <!-- Aviso de duplicata -->
        <div v-if="duplicateWarning" class="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
          <span class="text-sm text-amber-800 flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-600" />
            Esta nota ({{ duplicateWarning.access_key }}) já foi importada anteriormente.
          </span>
        </div>

        <!-- Lista de itens (cards verticais, mobile-first) -->
        <div class="space-y-3">
          <div
            v-for="(item, index) in nfceItems"
            :key="index"
            class="rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm"
          >
            <!-- Topo do card: nome, resumo de preços e checkbox ignorar -->
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm text-brand-text-primary break-words">
                  {{ item.raw_description }}
                </div>
                <div class="text-xs text-brand-text-muted mt-1 whitespace-nowrap">
                  Qtd: {{ formatNumber(item.quantity) }} ·
                  Unit: R$ {{ formatPrice(item.unit_price) }} ·
                  Total: R$ {{ formatPrice(item.total_price) }}
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2 sm:mt-0">
                <input
                  type="checkbox"
                  v-model="item.ignoreItem"
                  class="rounded text-brand-primary focus:ring-brand-primary"
                />
                <span class="text-xs text-brand-text-muted whitespace-nowrap">Ignorar este item</span>
              </div>
            </div>

            <!-- Corpo do card (apenas quando não ignorado) -->
            <div v-if="!item.ignoreItem" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Modo: criar novo insumo -->
              <div
                v-if="item.newIngredientMode"
                class="col-span-full space-y-2 sm:col-span-2"
              >
                <label class="block text-xs font-medium text-brand-text-muted">
                  Nome do novo insumo
                </label>
                <input
                  v-model="item.newIngredientName"
                  type="text"
                  placeholder="Nome do novo insumo"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs font-medium text-brand-text-muted">
                      Categoria
                    </label>
                    <select
                      v-model="item.newCategory"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    >
                      <option value="Laticínios">Laticínios</option>
                      <option value="Chocolates">Chocolates</option>
                      <option value="Farinhas/Secos">Farinhas/Secos</option>
                      <option value="Frutas">Frutas</option>
                      <option value="Embalagens">Embalagens</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-brand-text-muted">
                      Qtd. por embalagem / medida
                    </label>
                    <div class="flex items-end gap-2">
                      <input
                        v-model.number="item.newPackageSize"
                        type="number"
                        step="0.01"
                        placeholder="Tamanho"
                        class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                      />
                      <select
                        v-model="item.newBaseUnit"
                        class="px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                      >
                        <option value="un">un</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  @click="item.newIngredientMode = false"
                  class="text-xs text-brand-text-muted underline hover:text-brand-primary"
                >
                  Voltar à seleção existente
                </button>
              </div>

              <!-- Modo: vincular a insumo cadastrado -->
              <div v-else class="col-span-full space-y-2 sm:col-span-2">
                <label class="block text-xs font-medium text-brand-text-muted">
                  Vincular a insumo cadastrado
                </label>
                <select
                  v-model="item.selectedIngredientId"
                  @change="item.newIngredientMode = false"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                >
                  <option value="" class="text-brand-text-muted">
                    Selecionar insumo existente...
                  </option>
                  <option
                    v-for="(ing, i) in availableIngredients"
                    :key="i"
                    :value="ing.id"
                  >
                    {{ ing.name }} ({{ ing.category }}) ·
                    R$ {{ formatPrice(ing.costPerBaseUnit) }}/{{ ing.baseUnit }}
                  </option>
                  <option value="__NEW__" class="text-brand-primary">
                    + Cadastrar como novo insumo
                  </option>
                </select>
                <div
                  v-if="item.selectedIngredientId && !item.newIngredientMode && availableIngredients.find(i => i.id === item.selectedIngredientId)"
                  class="text-xs text-brand-text-muted mt-1"
                >
                  Custo atual: R$ {{ formatPrice(availableIngredients.find(i => i.id === item.selectedIngredientId).costPerBaseUnit) }}/{{ availableIngredients.find(i => i.id === item.selectedIngredientId).baseUnit }}
                </div>
                <p
                  class="text-xs text-brand-primary font-medium underline hover:text-brand-text-primary cursor-pointer"
                  @click="item.newIngredientMode = true"
                >
                  Criar novo insumo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rodapé fixo -->
      <div class="shrink-0 border-t p-4 sm:p-6 border-gray-100 bg-brand-surface flex items-center justify-between">
        <div class="text-sm text-brand-text-muted">
          {{ confirmableItems.length }} de {{ nfceItems.length }} item(s) pronto(s) para importar
        </div>
        <div class="flex gap-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            @click="confirmReconciliation"
            :disabled="confirmableItems.length === 0 || saving"
            class="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
          >
            {{ saving ? 'Processando...' : 'Confirmar e Atualizar Estoque' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { ingredientsService } from '@/services/ingredients'
import { invoicesService } from '@/services/invoices'
import { invoiceItemsService } from '@/services/invoiceItems'
import { recalculateCostsService } from '@/services/recalculateCosts'
import { financeService } from '@/services/finance'
import { X, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  visible: { type: Boolean, default: false },
  nfce: { type: Object, required: true },
})

const emit = defineEmits(['confirmed', 'close'])

const availableIngredients = ref([])
const nfceItems = ref([])
const duplicateWarning = ref(null)
const saving = ref(false)

const formatPrice = (price) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price || 0)

const formatDateBR = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR')
}

const formatNumber = (num) => Number(num || 0).toLocaleString('pt-Br')

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Similaridade simples por palavras-chave para sugerir insumo */
function suggestIngredient(desc) {
  if (!desc) return null
  const words = desc.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  let bestMatch = null
  let bestScore = 0

  for (const ing of availableIngredients.value) {
    const ingWords = ing.name.toLowerCase().split(/\s+/)
    let score = 0
    for (const w of words) {
      if (ingWords.some((iw) => iw.includes(w) || w.includes(iw))) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = ing
    }
  }

  return bestScore > 0 ? bestMatch : null
}

/** Inferência inteligente de embalagem a partir da descrição */
function inferPackageInfo(description) {
  if (!description) return { packageSize: 1, baseUnit: 'un', purchaseUnit: 'un', name: '' }

  const desc = description.toUpperCase()

  const patterns = [
    [/([\d.,]+)\s*KG/i, 'g', (v) => Math.round(v * 1000)],
    [/([\d.,]+)\s*K/i, 'g', (v) => Math.round(v * 1000)],
    [/([\d.,]+)\s*G/i, 'g', (v) => v],
    [/([\d.,]+)\s*ML/i, 'ml', (v) => v],
    [/([\d.,]+)\s*L/i, 'ml', (v) => Math.round(v * 1000)],
    [/([\d.,]+)\s*UN/i, 'un', (v) => v],
    [/([\d.,]+)\s*U/i, 'un', (v) => v],
  ]

  for (const [regex, baseUnit, converter] of patterns) {
    const match = desc.match(regex)
    if (match) {
      const rawValue = match[1].replace(',', '.')
      const value = parseFloat(rawValue)
      if (!isNaN(value)) {
        return {
          packageSize: converter(value),
          baseUnit,
          purchaseUnit: baseUnit === 'g' || baseUnit === 'ml' ? 'cx' : 'un',
          name: description.replace(regex, '').trim(),
        }
      }
    }
  }

  const isolatedNumber = desc.match(/(\d{2,4})/)
  if (isolatedNumber) {
    const value = parseInt(isolatedNumber[1], 10)
    if (value >= 10 && value <= 5000) {
      return { packageSize: value, baseUnit: 'g', purchaseUnit: 'cx', name: description }
    }
  }

  return { packageSize: 1, baseUnit: 'un', purchaseUnit: 'un', name: description }
}

onMounted(() => {
  loadIngredients()
  initializeItems()
})

async function loadIngredients() {
  try {
    availableIngredients.value = await ingredientsService.list()
  } catch (err) {
    console.error('[NfceReconciliation] Erro ao carregar insumos:', err.message)
  }
}

function initializeItems() {
  nfceItems.value = (props.nfce.items || []).map((item) => {
    const suggested = suggestIngredient(item.raw_description)
    const pkg = inferPackageInfo(item.raw_description)

    if (suggested) {
      // Match automático com insumo existente
      return {
        ...item,
        selectedIngredientId: suggested.id,
        newIngredientMode: false,
        newIngredientName: '',
        newCategory: suggested.category,
        newPackageSize: suggested.packageSize,
        newBaseUnit: suggested.baseUnit,
        ignoreItem: false,
      }
    }

    // Sem match: pré-selecionar "Cadastrar como novo insumo"
    return {
      ...item,
      selectedIngredientId: '__NEW__',
      newIngredientMode: true,
      newIngredientName: pkg.name || item.raw_description,
      newCategory: 'Outros',
      newPackageSize: pkg.packageSize,
      newBaseUnit: pkg.baseUnit,
      ignoreItem: false,
    }
  })
}

const confirmableItems = computed(() =>
  nfceItems.value.filter((i) => !i.ignoreItem && (i.selectedIngredientId || i.newIngredientMode))
)

const linkedCount = computed(() =>
  nfceItems.value.filter((i) => !i.ignoreItem && i.selectedIngredientId && i.selectedIngredientId !== '__NEW__').length
)

const newCount = computed(() =>
  nfceItems.value.filter((i) => !i.ignoreItem && (i.selectedIngredientId === '__NEW__' || i.newIngredientMode)).length
)

const ignoredCount = computed(() => nfceItems.value.filter((i) => i.ignoreItem).length)

const noUnlinkedItems = computed(() =>
  nfceItems.value.some((i) => !i.ignoreItem && (!i.selectedIngredientId || i.selectedIngredientId === '__NEW__'))
)

async function batchLinkAllNew() {
  for (const item of nfceItems.value) {
    if (!item.ignoreItem && (!item.selectedIngredientId || item.selectedIngredientId === '__NEW__')) {
      item.selectedIngredientId = '__NEW__'
      item.newIngredientMode = true
      const pkg = inferPackageInfo(item.raw_description)
      item.newIngredientName = pkg.name || item.raw_description
      item.newPackageSize = pkg.packageSize
      item.newBaseUnit = pkg.baseUnit
      item.newCategory = 'Outros'
    }
  }
}

async function batchIgnoreAllUnlinked() {
  for (const item of nfceItems.value) {
    if (!item.selectedIngredientId || item.selectedIngredientId === '__NEW__') {
      item.ignoreItem = true
      item.newIngredientMode = false
    }
  }
}

function resetSuggestions() {
  initializeItems()
}

async function confirmReconciliation() {
  saving.value = true
  let createdInvoiceId = null // declarada fora do try para o catch ter acesso

  try {
    // 1. Verificar duplicata de access_key (usando maybeSingle para evitar erro 406 quando não existe)
    const { data: existingInvoice, error: checkError } = await supabase
      .from('invoices')
      .select('id, access_key, invoice_items(id)')
      .eq('access_key', props.nfce.accessKey)
      .maybeSingle()

    if (checkError) throw checkError

    // Verificação inteligente: se a nota existe mas não tem itens (registro órfão de tentativa anterior), remove e prossegue
    if (existingInvoice) {
      const itemsCount = existingInvoice.invoice_items?.length || 0
      if (itemsCount === 0) {
        // Remove registro órfão para permitir nova importação
        await supabase.from('invoices').delete().eq('id', existingInvoice.id)
      } else {
        duplicateWarning.value = existingInvoice
        saving.value = false
        return
      }
    }

    // 2. Gerar UUID explícito no frontend para evitar dependência de .select('id').single()
    createdInvoiceId = crypto.randomUUID()

    // Inserir nota fiscal com ID explícito
    const { error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        id: createdInvoiceId,
        access_key: props.nfce.accessKey,
        store_name: props.nfce.storeName,
        issue_date: props.nfce.issueDate,
        total_amount: props.nfce.totalAmount,
        raw_url: props.nfce.rawUrl,
      })

    if (invoiceError) throw invoiceError

    // 3. Processar cada item
    for (const item of nfceItems.value) {
      if (item.ignoreItem) continue

      let ingredientId = item.selectedIngredientId

      // Se o usuário selecionou "__NEW__" no dropdown, entra no modo de criação de novo insumo
      if (ingredientId === '__NEW__') {
        item.newIngredientMode = true
      }

      // Se modo "novo insumo", criar o insumo primeiro (antes de vincular ao invoice_item)
      if (item.newIngredientMode && item.newIngredientName) {
        const newIngredientId = crypto.randomUUID()
        const { error: newIngErr } = await supabase
          .from('ingredients')
          .insert({
            id: newIngredientId,
            name: item.newIngredientName,
            category: item.newCategory,
            purchase_unit: 'cx',
            package_size: item.newPackageSize,
            base_unit: item.newBaseUnit,
            last_unit_cost: item.unit_price * item.newPackageSize,
            stock_quantity: 0,
            min_stock_alert: 0,
          })
        if (newIngErr) throw newIngErr
        ingredientId = newIngredientId
      }

      // Validação obrigatória: ingredient_id nunca pode ser "__NEW__", vazio ou não-UUID
      const isValidUuid = UUID_REGEX.test(String(ingredientId))
      if (!isValidUuid) {
        throw new Error(
          `Insumo inválido para "${item.raw_description}": selecione um insumo existente ou cadastre um novo.`
        )
      }

      // Guard final: garantir que __NEW__ não chegue ao banco
      if (ingredientId === '__NEW__' || !ingredientId) {
        throw new Error(
          `ingredient_id inválido para "${item.raw_description}". Verifique se o insumo foi vinculado corretamente.`
        )
      }

      const finalIngredientId = ingredientId

      // Inserir item da nota com invoice_id e ingredient_id explícitos
      const { error: itemErr } = await supabase
        .from('invoice_items')
        .insert({
          invoice_id: createdInvoiceId,
          ingredient_id: finalIngredientId,
          raw_description: item.raw_description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })

      if (itemErr) throw itemErr

      // Atualizar estoque e custo do insumo
      const { data: existingIng, error: getIngErr } = await ingredientsService.get(finalIngredientId)
      if (getIngErr) throw getIngErr

      const quantityBaseUnit = item.quantity * (item.newIngredientMode ? item.newPackageSize : existingIng?.packageSize ?? 1)
      const currentStock = Number(existingIng?.stock_quantity ?? existingIng?.stockQuantity ?? 0)
      const newStock = currentStock + quantityBaseUnit

      // last_unit_cost = preço pago por embalagem nesta nota
      const newLastUnitCost = item.unit_price * (item.newIngredientMode ? item.newPackageSize : existingIng?.packageSize ?? 1)

      if (existingIng) {
        // Insumo já existente: soma a quantidade comprada ao saldo atual
        await ingredientsService.update(finalIngredientId, {
          ...existingIng,
          stock_quantity: newStock,
          last_unit_cost: newLastUnitCost,
        })
      } else if (item.newIngredientMode) {
        // Insumo recém-criado nesta nota: já foi inserido com stock 0, define o estoque inicial da compra
        await supabase
          .from('ingredients')
          .update({
            stock_quantity: newStock,
            last_unit_cost: newLastUnitCost,
          })
          .eq('id', finalIngredientId)
      }

      // Registra movimento de entrada de estoque (não bloqueia se a tabela ainda não existir)
      try {
        await supabase.from('stock_movements').insert({
          ingredient_id: finalIngredientId,
          movement_type: 'entrada',
          quantity: quantityBaseUnit,
          reason: `NFC-e #${props.nfce.accessKey}`,
          reference_id: createdInvoiceId,
        })
      } catch (movErr) {
        console.warn('[NfceReconciliation] Não foi possível registrar movimento de estoque:', movErr.message)
      }
    }

    // 4. Disparar recálculo em cascata
    await recalculateCostsService.recalculateAllCosts()

    // Recarrega a lista de insumos do banco para refletir os novos itens e saldos reais
    await loadIngredients()
    emit('saved')

    // Registra saída financeira automática da compra NFC-e (não bloqueia a importação)
    try {
      const totalAmount = Number(props.nfce.totalAmount) || 0
      if (totalAmount > 0) {
        await financeService.upsertByReference('invoice', createdInvoiceId, {
          type: 'saida',
          category: 'Insumos / Mercado',
          description: `Compra NFC-e - ${props.nfce.storeName}`,
          amount: totalAmount,
          transactionDate: props.nfce.issueDate,
          paymentMethod: 'Pix',
          referenceType: 'invoice',
          referenceId: createdInvoiceId,
        })
      }
    } catch (finErr) {
      console.warn('[NfceReconciliation] Não foi possível registrar lançamento financeiro:', finErr.message)
    }

    emit('confirmed', { id: createdInvoiceId, access_key: props.nfce.accessKey })
    closeModal()
  } catch (err) {
    // Rollback automático: se a nota já foi inserida no banco mas algo falhou depois,
    // remove o cabeçalho órfão para permitir nova tentativa sem trava de duplicidade
    try {
      if (createdInvoiceId) {
        await supabase.from('invoices').delete().eq('id', createdInvoiceId)
      }
    } catch (rollbackErr) {
      console.error('[NfceReconciliation] Erro no rollback:', rollbackErr.message)
    }

    console.error('[NfceReconciliation] Erro:', err)
    alert(err.message || 'Erro ao processar conciliação.')
  } finally {
    saving.value = false
  }
}

function toNum(v) {
  return Number(v) || 0
}

function closeModal() {
  emit('close')
}
</script>
