<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
      <div>
        <h2 class="font-display font-medium text-2xl text-brand-text-primary">
          Financeiro &amp; Fluxo de Caixa
        </h2>
        <p class="text-brand-text-muted">
          Controle de entradas, saídas e lucro líquido do período.
        </p>
      </div>
      <button
        @click="openTransactionModal()"
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
        Novo Lançamento
      </button>
      <button
        @click="syncPreviousInvoices"
        class="px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded border border-gray-200"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
        Sincronizar notas anteriores
      </button>
    </div>

    <!-- Cards de resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
      <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
        <p class="text-xs text-brand-text-muted uppercase tracking-wider">Total de Entradas</p>
        <p class="font-display font-medium text-2xl text-brand-primary">
          {{ formatPrice(totalEntries) }}
        </p>
        <p class="text-xs text-brand-text-muted mt-1">
          {{ filteredTransactions.filter((t) => t.type === 'entrada').length }} lançamento(s)
        </p>
      </div>
      <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
        <p class="text-xs text-brand-text-muted uppercase tracking-wider">Total de Saídas</p>
        <p class="font-display font-medium text-2xl text-red-600">
          {{ formatPrice(totalExits) }}
        </p>
        <p class="text-xs text-brand-text-muted mt-1">
          {{ filteredTransactions.filter((t) => t.type === 'saida').length }} lançamento(s)
        </p>
      </div>
      <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
        <p class="text-xs text-brand-text-muted uppercase tracking-wider">Saldo / Lucro Líquido</p>
        <p class="font-display font-medium text-2xl"
           :class="balance >= 0 ? 'text-brand-primary' : 'text-red-600'">
          {{ formatPrice(balance) }}
        </p>
        <p class="text-xs text-brand-text-muted mt-1">
          Período: {{ periodLabel }}
        </p>
      </div>
    </div>

    <!-- Barra comparativa Entradas vs Saídas -->
    <div class="bg-brand-surface border border-gray-100 rounded-xl p-5 mb-4 shadow-sm">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-xs font-medium text-brand-text-muted uppercase">Entradas vs Saídas do Período</span>
        <span
          class="text-xs font-bold"
          :class="balance >= 0 ? 'text-emerald-600' : 'text-rose-600'"
        >
          {{ balance >= 0 ? 'Lucro' : 'Prejuízo' }} de {{ formatPrice(Math.abs(balance)) }}
        </span>
      </div>
      <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-brand-primary transition-all duration-500"
          :style="{ width: entriesPercentage + '%' }"
          :title="`Entradas: ${formatPrice(totalEntries)}`"
        ></div>
        <div
          class="h-full bg-rose-500 transition-all duration-500"
          :style="{ width: exitsPercentage + '%' }"
          :title="`Saídas: ${formatPrice(totalExits)}`"
        ></div>
      </div>
      <div class="flex justify-between text-[10px] font-medium mt-2">
        <span class="text-brand-text-muted">
          Entradas: {{ formatPrice(totalEntries) }} ({{ Math.round(entriesPercentage) }}%)
        </span>
        <span class="text-rose-600">
          Saídas: {{ formatPrice(totalExits) }} ({{ Math.round(exitsPercentage) }}%)
        </span>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-3 mb-1">
      <button
        v-for="p in periodOptions"
        :key="p"
        @click="periodFilter = p"
        :class="[
          'px-3 py-1.5 rounded text-sm font-medium transition-colors',
          periodFilter === p
            ? 'bg-brand-primary text-white'
            : 'bg-brand-surface text-brand-text-muted border border-gray-200 hover:bg-gray-50',
        ]"
      >
        {{ periodLabelMap[p] }}
      </button>
      <button
        v-for="t in typeOptions"
        :key="t"
        @click="typeFilter = t"
        :class="[
          'px-3 py-1.5 rounded text-sm font-medium transition-colors',
          typeFilter === t
            ? 'bg-brand-primary text-white'
            : 'bg-brand-surface text-brand-text-muted border border-gray-200 hover:bg-gray-50',
        ]"
      >
        {{ typeLabel(t) }}
      </button>
    </div>

    <!-- Extrato de lançamentos -->
    <div v-if="filteredTransactions.length === 0" class="text-center py-12 text-brand-text-muted">
      <p>Nenhum lançamento encontrado.</p>
      <button v-if="periodFilter !== 'todos' || typeFilter !== 'todas'" @click="resetFilters" class="btn-primary mt-4 px-4 py-2">
        Limpar filtros
      </button>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="bg-brand-surface border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
      >
        <div class="flex items-center gap-3 sm:flex-1">
          <span class="text-xs font-medium text-brand-text-muted uppercase">
            {{ formatDate(tx.transactionDate) }}
          </span>
          <div>
            <div class="font-medium text-brand-text-primary">{{ tx.description }}</div>
            <div class="text-xs text-brand-text-muted">
              {{ tx.category }} · {{ tx.paymentMethod }}
              <span v-if="tx.referenceType === 'order'"> (Automático: Pedido)</span>
              <span v-else-if="tx.referenceType === 'invoice'"> (Automático: NFC-e)</span>
              <span v-else-if="tx.referenceType === 'manual'"> (Manual)</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:flex-1 justify-center sm:justify-end">
          <span
            :class="[
              'font-semibold',
              tx.type === 'entrada' ? 'text-brand-primary' : 'text-red-600',
            ]"
          >
            {{ tx.type === 'entrada' ? '+' : '-' }} {{ formatPrice(tx.amount) }}
          </span>
        </div>

        <div class="flex items-center gap-2 sm:flex-1 justify-end">
          <button
            @click="editTransaction(tx)"
            class="text-xs text-brand-primary underline hover:text-brand-accent px-2 py-1"
          >
            Editar
          </button>
          <button
            @click="deleteTransaction(tx.id)"
            class="text-xs text-red-600 hover:text-red-800 px-2 py-1"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal novo/editar lançamento -->
    <div
      v-if="showTransactionModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm"
      @click.self="closeTransactionModal"
    >
      <div
        class="w-full max-w-md max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden bg-brand-surface border border-gray-100"
        @click.stop
      >
        <!-- Cabeçalho fixo -->
        <div class="shrink-0 border-b p-4 sm:p-6 border-gray-100 flex items-center justify-between bg-brand-surface">
          <h3 class="font-display font-medium text-lg text-brand-text-primary">
            {{ editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento' }}
          </h3>
          <button
            @click="closeTransactionModal"
            class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
            aria-label="Fechar"
          >
            <span class="text-2xl">✕</span>
          </button>
        </div>

        <!-- Corpo rolável -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-brand-surface">
          <form @submit.prevent="saveTransaction" class="space-y-5">
            <!-- Tipo -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Tipo de lançamento
              </label>
              <select
                v-model="form.type"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              >
                <option value="entrada">Entrada (receita)</option>
                <option value="saida">Saída (despesa)</option>
              </select>
            </div>

            <!-- Descrição -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Descrição
              </label>
              <input
                v-model="form.description"
                type="text"
                required
                placeholder="Ex: Botijão de gás, Encomenda da Maria, Compra de farinha"
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
                <option value="Encomendas">Encomendas</option>
                <option value="Vendas Avulsas">Vendas Avulsas</option>
                <option value="Insumos / Mercado">Insumos / Mercado</option>
                <option value="Embalagens">Embalagens</option>
                <option value="Contas Fixas (Gás/Luz/Água)">Contas Fixas (Gás/Luz/Água)</option>
                <option value="Entregas / Frete">Entregas / Frete</option>
                <option value="Equipamentos">Equipamentos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <!-- Valor -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Valor (R$)
              </label>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <!-- Data -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Data do lançamento
              </label>
              <input
                v-model="form.transactionDate"
                type="date"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <!-- Forma de pagamento -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Forma de pagamento
              </label>
              <select
                v-model="form.paymentMethod"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              >
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Transferência">Transferência</option>
              </select>
            </div>
          </form>
        </div>

        <!-- Rodapé fixo -->
        <div class="shrink-0 border-t p-4 sm:p-6 border-gray-100 bg-brand-surface flex items-center justify-between">
          <button
            @click="closeTransactionModal"
            class="px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="transaction-form"
            :disabled="savingTransaction"
            class="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
          >
            {{ savingTransaction ? 'Salvando...' : editingTransaction ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { financeService } from '@/services/finance'
import { invoicesService } from '@/services/invoices'
import { useToast } from '@/composables/useToast'

const props = defineProps({})
const emit = defineEmits([])
const { success, error: toastError } = useToast()

// Helpers
const formatPrice = (price) => {
  if (price == null || Number.isNaN(Number(price))) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(price))
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR')
}

// Filtros
const periodFilter = ref('mes_atual') // mes_atual, mes_anterior, ultimos_30_dias, todos
const typeFilter = ref('todas') // todas, entrada, saida

const periodOptions = ['mes_atual', 'mes_anterior', 'ultimos_30_dias', 'todos']
const typeOptions = ['todas', 'entrada', 'saida']

const periodLabelMap = {
  mes_atual: 'Mês Atual',
  mes_anterior: 'Mês Anterior',
  ultimos_30_dias: 'Últimos 30 dias',
  todos: 'Todos',
}

const typeLabel = (t) => {
  const labels = { todas: 'Todas', entrada: 'Entradas', saida: 'Saídas' }
  return labels[t] || t
}

// Estado
const transactions = ref([])
const loading = ref(false)
const error = ref('')
const savingTransaction = ref(false)

const periodStart = computed(() => {
  const now = new Date()
  switch (periodFilter.value) {
    case 'mes_atual':
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    case 'mes_anterior':
      return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10)
    case 'ultimos_30_dias': {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      return d.toISOString().slice(0, 10)
    }
    default:
      return ''
  }
})

const periodEnd = computed(() => {
  if (periodFilter.value === 'mes_atual' || periodFilter.value === 'mes_anterior') {
    const now = new Date()
    const m = periodFilter.value === 'mes_atual' ? now.getMonth() : now.getMonth() - 1
    return new Date(now.getFullYear(), m + 1, 0).toISOString().slice(0, 10)
  }
  return ''
})

const periodLabel = computed(() => {
  if (periodFilter.value === 'todos') return 'Todo o período'
  const start = periodStart.value
  const end = periodEnd.value
  if (!start || !end) return ''
  const f = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${f(start)} a ${f(end)}`
})

const filteredTransactions = computed(() => {
  return transactions.value.filter((tx) => {
    const matchPeriod =
      periodFilter.value === 'todos' ||
      (tx.transactionDate >= periodStart.value && tx.transactionDate <= periodEnd.value)
    const matchType = typeFilter.value === 'todas' || tx.type === typeFilter.value
    return matchPeriod && matchType
  })
})

const totalEntries = computed(() =>
  (filteredTransactions.value || [])
    .filter((t) => t.type === "entrada")
    .reduce((sum, t) => sum + t.amount, 0)
)

const totalExits = computed(() =>
  (filteredTransactions.value || [])
    .filter((t) => t.type === "saida")
    .reduce((sum, t) => sum + t.amount, 0)
)

const balance = computed(() => totalEntries.value - totalExits.value)

// Percentuais para barra comparativa Entradas vs Saídas
const entriesPercentage = computed(() => {
  const total = totalEntries.value + totalExits.value
  if (total <= 0) return 50
  return Math.round((totalEntries.value / total) * 100)
})

const exitsPercentage = computed(() => {
  const total = totalEntries.value + totalExits.value
  if (total <= 0) return 50
  return Math.round((totalExits.value / total) * 100)
})

// Modal state
const showTransactionModal = ref(false)
const editingTransaction = ref(null)
const form = ref({
  type: 'saida',
  category: 'Outros',
  description: '',
  amount: 0,
  transactionDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'Pix',
})

onMounted(() => {
  loadTransactions()
})

async function loadTransactions() {
  loading.value = true
  try {
    transactions.value = await financeService.list()
  } catch (err) {
    error.value = err.message || 'Erro ao carregar lançamentos.'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  periodFilter.value = 'mes_atual'
  typeFilter.value = 'todas'
}

async function syncPreviousInvoices() {
  try {
    const invoices = await invoicesService.list()
    const existingTx = transactions.value.filter(
      (t) => t.referenceType === 'invoice'
    )
    const existingInvoiceIds = new Set(existingTx.map((t) => t.referenceId))

    let synced = 0
    for (const inv of invoices || []) {
      if (existingInvoiceIds.has(inv.id)) continue
      const totalAmount = Number(inv.totalAmount) || 0
      if (totalAmount <= 0) continue
      await financeService.upsertByReference('invoice', inv.id, {
        type: 'saida',
        category: 'Insumos / Mercado',
        description: `Compra NFC-e - ${inv.storeName}`,
        amount: totalAmount,
        transactionDate: inv.issueDate ? inv.issueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        paymentMethod: 'Pix',
        referenceType: 'invoice',
        referenceId: inv.id,
      })
      synced++
    }

    await loadTransactions()
    success(synced > 0 ? `${synced} nota(s) fiscal(ais) sincronizada(s) ao financeiro.` : 'Todas as notas já estavam sincronizadas.')
  } catch (err) {
    toastError(err.message || 'Erro ao sincronizar notas fiscais.')
  }
}

function openTransactionModal(tx = null) {
  editingTransaction.value = tx
  if (tx) {
    form.value = {
      type: tx.type,
      category: tx.category,
      description: tx.description,
      amount: tx.amount,
      transactionDate: tx.transactionDate,
      paymentMethod: tx.paymentMethod || 'Pix',
    }
  } else {
    form.value = {
      type: 'saida',
      category: 'Outros',
      description: '',
      amount: 0,
      transactionDate: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Pix',
    }
  }
  showTransactionModal.value = true
}

function closeTransactionModal() {
  showTransactionModal.value = false
  editingTransaction.value = null
}

async function saveTransaction() {
  if (!form.value.description) return
  if (!form.value.amount || form.value.amount <= 0) return

  savingTransaction.value = true
  try {
    const payload = {
      type: form.value.type,
      category: form.value.category,
      description: form.value.description,
      amount: Number(form.value.amount),
      transactionDate: form.value.transactionDate,
      paymentMethod: form.value.paymentMethod,
      referenceType: 'manual',
      referenceId: null,
    }

    if (editingTransaction.value) {
      await financeService.update(editingTransaction.value.id, payload)
    } else {
      await financeService.create(payload)
    }

    closeTransactionModal()
    await loadTransactions()
  } catch (err) {
    toastError(err.message || 'Erro ao salvar lançamento.')
  } finally {
    savingTransaction.value = false
  }
}

function editTransaction(tx) {
  openTransactionModal(tx)
}

async function deleteTransaction(id) {
  if (!confirm('Excluir este lançamento?')) return
  try {
    await financeService.remove(id)
    await loadTransactions()
  } catch (err) {
    toastError(err.message || 'Erro ao excluir lançamento.')
  }
}
</script>
