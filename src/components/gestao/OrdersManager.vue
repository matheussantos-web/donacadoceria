<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
      <div>
        <h2 class="font-display font-medium text-2xl text-brand-text-primary">
          Pedidos &amp; Encomendas
        </h2>
        <p class="text-brand-text-muted">
          Controle de encomendas, pagamentos e baixa automática de estoque.
        </p>
      </div>
      <button
        @click="openOrderModal()"
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
        Novo Pedido
      </button>
    </div>

    <!-- Filtros rápidos por status + busca -->
    <div class="flex flex-wrap items-center gap-3 mb-1">
      <button
        v-for="status in statusOptions"
        :key="status"
        @click="statusFilter = status"
        :class="[
          'px-3 py-1.5 rounded text-sm font-medium transition-colors',
          statusFilter === status
            ? 'bg-brand-primary text-white'
            : 'bg-brand-surface text-brand-text-muted border border-gray-200 hover:bg-gray-50',
        ]"
      >
        {{ statusLabel(status) }}
      </button>
      <input
        v-model="searchQuery"
        @input="applyFilters"
        placeholder="Buscar cliente..."
        class="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
      />
    </div>

    <!-- Lista de pedidos (cards mobile-first) -->
    <div v-if="filteredOrders.length === 0" class="text-center py-12 text-brand-text-muted">
      <p>Nenhum pedido encontrado.</p>
      <button v-if="searchQuery || statusFilter !== 'todos'" @click="resetFilters" class="btn-primary mt-4 px-4 py-2">
        Limpar filtros
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-brand-surface border border-gray-100 rounded-xl p-4 flex flex-col hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <h4 class="font-medium text-brand-text-primary">{{ order.customerName }}</h4>
            <p class="text-xs text-brand-text-muted">{{ order.customerPhone }}</p>
          </div>
          <span
            :class="[
              'px-2 py-1 rounded text-[10px] font-medium uppercase',
              statusBadgeClass(order.status),
            ]"
            @click="advanceStatus(order)"
            style="cursor: pointer;"
            :title="`Avançar para ${nextStatusLabel(order.status)}`"
          >
            {{ statusLabel(order.status) }}
          </span>
        </div>

        <div class="mt-2 space-y-1 text-sm">
          <div class="flex justify-between text-brand-text-muted">
            <span>Entrega</span>
            <span
              :class="[
                'font-medium',
                isDeliverySoon(order.deliveryDate) ? 'text-brand-primary font-bold' : 'text-brand-text-primary',
              ]"
            >
              {{ formatDeliveryDate(order.deliveryDate) }}
            </span>
          </div>
          <div class="flex justify-between text-brand-text-muted">
            <span>Itens</span>
            <span class="font-medium">{{ order.items?.length || 0 }}</span>
          </div>
          <div class="flex justify-between text-brand-text-muted">
            <span>Total</span>
            <span class="font-medium text-brand-text-primary">
              {{ formatPrice(order.totalAmount) }}
            </span>
          </div>
          <div class="flex justify-between text-brand-text-muted">
            <span>Sinal pago</span>
            <span class="font-medium">{{ formatPrice(order.depositPaid) }}</span>
          </div>
          <div class="flex justify-between text-brand-text-muted">
            <span>Saldo a receber</span>
            <span
              class="font-medium"
              :class="order.totalAmount > order.depositPaid ? 'text-red-600' : 'text-brand-primary'"
            >
              {{ formatPrice(Math.max(0, order.totalAmount - order.depositPaid)) }}
            </span>
          </div>
        </div>

        <!-- Estoque baixado? -->
        <div class="mt-3 flex items-center gap-1.5 text-xs">
          <span
            class="px-1.5 py-0.5 rounded"
            :class="
              order.stockDeducted
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-gray-50 text-gray-500 border border-gray-100'
            "
          >
            {{ order.stockDeducted ? 'Estoque baixado' : 'Estoque pendente' }}
          </span>
        </div>

        <!-- Stepper visual de status -->
        <div class="mt-3">
          <div class="flex items-center gap-1">
            <div
              class="flex-1 h-0.5"
              :class="
                order.status === 'pendente'
                  ? 'bg-gray-200'
                  : 'bg-brand-primary'
              "
            ></div>
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
              :class="
                order.status === 'pendente'
                  ? 'bg-brand-primary border-brand-primary text-white'
                  : 'bg-white border-gray-300 text-brand-text-muted'
              "
            >
              1
            </div>
            <div
              class="flex-1 h-0.5"
              :class="
                order.status === 'em_producao' || order.status === 'entregue'
                  ? 'bg-brand-primary'
                  : 'bg-gray-200'
              "
            ></div>
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
              :class="
                order.status === 'em_producao'
                  ? 'bg-brand-primary border-brand-primary text-white'
                  : order.status === 'entregue'
                  ? 'bg-brand-primary border-brand-primary text-white'
                  : 'bg-white border-gray-300 text-brand-text-muted'
              "
            >
              2
            </div>
            <div
              class="flex-1 h-0.5"
              :class="
                order.status === 'entregue'
                  ? 'bg-brand-primary'
                  : 'bg-gray-200'
              "
            ></div>
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
              :class="
                order.status === 'entregue'
                  ? 'bg-brand-primary border-brand-primary text-white'
                  : 'bg-white border-gray-300 text-brand-text-muted'
              "
            >
              3
            </div>
          </div>
          <div class="flex justify-between text-[10px] font-medium mt-1">
            <span
              :class="
                order.status === 'pendente'
                  ? 'text-brand-primary font-bold'
                  : 'text-brand-text-muted'
              "
            >
              Pendente
            </span>
            <span
              :class="
                order.status === 'em_producao'
                  ? 'text-brand-primary font-bold'
                  : 'text-brand-text-muted'
              "
            >
              Em Produção
            </span>
            <span
              :class="
                order.status === 'entregue'
                  ? 'text-brand-primary font-bold'
                  : 'text-brand-text-muted'
              "
            >
              Entregue
            </span>
          </div>
        </div>

        <div class="mt-auto pt-3 border-t border-gray-100 flex gap-2">
          <button
            @click="openOrderModal(order)"
            class="flex-1 btn-secondary py-1.5 text-xs font-medium"
          >
            Editar
          </button>
          <button
            @click="deleteOrder(order.id)"
            class="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de criar/editar pedido -->
    <div
      v-if="showOrderModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm"
      @click.self="closeOrderModal"
    >
      <div
        class="w-full max-w-lg max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden bg-brand-surface border border-gray-100"
        @click.stop
      >
        <!-- Cabeçalho fixo -->
        <div class="shrink-0 border-b p-4 sm:p-6 border-gray-100 flex items-center justify-between bg-brand-surface">
          <h3 class="font-display font-medium text-lg text-brand-text-primary">
            {{ editingOrder ? 'Editar Pedido' : 'Novo Pedido' }}
          </h3>
          <button
            @click="closeOrderModal"
            class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
            aria-label="Fechar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Corpo rolável -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-brand-surface">
          <form @submit.prevent="saveOrder" class="space-y-5">
            <!-- Cliente -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Nome do cliente
              </label>
              <input
                v-model="form.customerName"
                type="text"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                WhatsApp / Telefone
              </label>
              <input
                v-model="form.customerPhone"
                type="tel"
                placeholder="(11) 99999-9999"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>

            <!-- Data e hora de entrega -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-brand-text-muted mb-1">
                  Data de entrega
                </label>
                <input
                  v-model="form.deliveryDate"
                  type="date"
                  required
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-text-muted mb-1">
                  Horário
                </label>
                <input
                  v-model="form.deliveryTime"
                  type="time"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>
            </div>

            <!-- Produtos / Itens -->
            <div class="pt-4 border-t border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-brand-text-primary">Itens da encomenda</h4>
                <button
                  @click="addOrderItem"
                  class="text-xs text-brand-primary underline hover:text-brand-accent"
                >
                  + Adicionar produto
                </button>
              </div>

              <div
                v-for="(item, idx) in form.items"
                :key="item.idx"
                class="flex gap-2 items-end mb-2 bg-brand-bg/50 p-3 rounded border border-gray-100"
              >
                <!-- Produto -->
                <select
                  v-model="item.pricedProductId"
                  @change="selectProduct(idx)"
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
                >
                  <option value="">Selecionar produto...</option>
                  <option
                    v-for="product in availableProducts"
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.name }} · {{ formatPrice(product.finalPrice || product.suggestedPrice) }}
                  </option>
                </select>

                <!-- Quantidade -->
                <input
                  v-model.number="item.quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Qtd"
                  @input="calcItemSubtotal(idx)"
                  class="w-24 px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm text-right"
                />

                <!-- Preço unitário -->
                <input
                  v-model.number="item.unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="V. Unit."
                  @input="calcItemSubtotal(idx)"
                  class="w-28 px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm text-right"
                />

                <!-- Subtotal -->
                <span class="w-20 text-xs font-medium text-brand-text-primary text-right">
                  {{ formatPrice(item.subtotal) }}
                </span>

                <!-- Remover -->
                <button
                  @click="removeOrderItem(idx)"
                  class="text-red-600 hover:text-red-800 text-xs"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div v-if="form.items.length === 0" class="text-brand-text-muted text-xs mt-2">
                Nenhum item adicionado ainda.
              </div>

              <!-- Total do pedido -->
              <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                <span class="font-medium text-brand-text-primary">Total da encomenda:</span>
                <span class="font-display font-medium text-xl text-brand-text-primary">
                  {{ formatPrice(orderTotal) }}
                </span>
              </div>
            </div>

            <!-- Pagamento -->
            <div class="pt-4 border-t border-gray-100">
              <h4 class="font-medium text-brand-text-primary mb-3">Pagamento</h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-text-muted mb-1">
                    Sinal pago (R$)
                  </label>
                  <input
                    v-model.number="form.depositPaid"
                    type="number"
                    step="0.01"
                    min="0"
                    @input="calcPaymentStatus"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-text-muted mb-1">
                    Saldo a receber (R$)
                  </label>
                  <input
                    v-model.number="form.balanceDue"
                    type="number"
                    step="0.01"
                    min="0"
                    readonly
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-brand-text-muted mb-1">
                  Status de pagamento
                </label>
                <select
                  v-model="form.paymentStatus"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                >
                  <option value="pendente">Pendente</option>
                  <option value="sinal_pago">Sinal Pago</option>
                  <option value="pago">Pago Integral</option>
                </select>
              </div>
            </div>

            <!-- Observações -->
            <div>
              <label class="block text-sm font-medium text-brand-text-muted mb-1">
                Observações (tema, massa, recheio, decoração)
              </label>
              <textarea
                v-model="form.notes"
                rows="2"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              />
            </div>
          </form>
        </div>

        <!-- Rodapé fixo -->
        <div class="shrink-0 border-t p-4 sm:p-6 border-gray-100 bg-brand-surface flex items-center justify-between">
          <button
            @click="closeOrderModal"
            class="px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="order-form"
            :disabled="savingOrder"
            class="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
          >
            {{ savingOrder ? 'Salvando...' : editingOrder ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ordersService } from '@/services/orders'
import { pricedProductsService } from '@/services/recipes'
import { useToast } from '@/composables/useToast'

const props = defineProps({})
const emit = defineEmits([])
const { success, error: toastError } = useToast()

// Helpers de formatação
const formatPrice = (price) => {
  if (price == null || Number.isNaN(Number(price))) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(price))
}
const formatNumber = (num) => {
  if (num == null || Number.isNaN(Number(num))) return '0'
  return Number(num).toLocaleString('pt-BR')
}

// Estado
const orders = ref([])
const availableProducts = ref([])
const loading = ref(false)
const error = ref('')
const savingOrder = ref(false)

// Filtros
const searchQuery = ref('')
const statusFilter = ref('todos')

const statusOptions = ['todos', 'pendente', 'em_producao', 'entregue', 'cancelado']

const statusLabel = (status) => {
  const labels = {
    todos: 'Todos',
    pendente: 'Pendente',
    em_producao: 'Em Produção',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
  }
  return labels[status] || status
}

const statusBadgeClass = (status) => {
  const classes = {
    pendente: 'bg-amber-50 text-amber-700 border border-amber-100',
    em_producao: 'bg-blue-50 text-blue-700 border border-blue-100',
    entregue: 'bg-green-50 text-green-700 border border-green-100',
    cancelado: 'bg-red-50 text-red-700 border border-red-100',
  }
  return classes[status] || 'bg-gray-50 text-gray-500 border border-gray-100'
}

const nextStatusLabel = (status) => {
  const next = {
    pendente: 'Em Produção',
    em_producao: 'Entregue',
    entregue: 'Concluído',
    cancelado: 'Reativar',
  }
  return next[status] || ''
}

const applyFilters = () => {
  const q = searchQuery.value.toLowerCase()
  const s = statusFilter.value
  filteredOrders.value = orders.value.filter((o) => {
    const matchSearch =
      o.customerName.toLowerCase().includes(q) ||
      (o.customerPhone && o.customerPhone.includes(q))
    const matchStatus = s === 'todos' || o.status === s
    return matchSearch && matchStatus
  })
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'todos'
  applyFilters()
}

const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    const q = searchQuery.value.toLowerCase()
    const s = statusFilter.value
    const matchSearch =
      o.customerName.toLowerCase().includes(q) ||
      (o.customerPhone && o.customerPhone.includes(q))
    const matchStatus = s === 'todos' || o.status === s
    return matchSearch && matchStatus
  })
})

const isDeliverySoon = (date) => {
  if (!date) return false
  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dDay = new Date(d)
  dDay.setHours(0, 0, 0, 0)
  return dDay.getTime() === today.getTime() || dDay.getTime() === tomorrow.getTime()
}

const formatDeliveryDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Modal state
const showOrderModal = ref(false)
const editingOrder = ref(null)
const form = ref({
  customerName: '',
  customerPhone: '',
  deliveryDate: '',
  deliveryTime: '',
  status: 'pendente',
  totalAmount: 0,
  depositPaid: 0,
  paymentStatus: 'pendente',
  notes: '',
  items: [],
})

onMounted(() => {
  loadOrders()
  loadProducts()
})

async function loadOrders() {
  loading.value = true
  try {
    orders.value = await ordersService.list()
    applyFilters()
  } catch (err) {
    error.value = err.message || 'Erro ao carregar pedidos.'
  } finally {
    loading.value = false
  }
}

async function loadProducts() {
  try {
    availableProducts.value = await pricedProductsService.list()
  } catch (err) {
    console.warn('[OrdersManager] Não foi carregar produtos.', err.message)
  }
}

const orderTotal = computed(() => {
  return (form.value.items || []).reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
})

function openOrderModal(order = null) {
  editingOrder.value = order
  const nextItemIdx = form.value.items.length
  if (order) {
    form.value = {
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryDate: order.deliveryDate ? order.deliveryDate.slice(0, 10) : '',
      deliveryTime: order.deliveryDate ? order.deliveryDate.slice(11, 16) : '',
      status: order.status,
      totalAmount: order.totalAmount,
      depositPaid: order.depositPaid,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      items: (order.items || []).map((item, i) => ({
        idx: i,
        pricedProductId: item.pricedProductId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    }
  } else {
    form.value = {
      customerName: '',
      customerPhone: '',
      deliveryDate: '',
      deliveryTime: '',
      status: 'pendente',
      totalAmount: 0,
      depositPaid: 0,
      paymentStatus: 'pendente',
      notes: '',
      items: [],
    }
  }
  showOrderModal.value = true
}

function closeOrderModal() {
  showOrderModal.value = false
  editingOrder.value = null
}

function addOrderItem() {
  form.value.items.push({
    idx: Date.now(),
    pricedProductId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    subtotal: 0,
  })
}

function removeOrderItem(idx) {
  form.value.items = form.value.items.filter((i) => i.idx !== idx)
}

async function selectProduct(itemIdx) {
  const item = form.value.items.find((i) => i.idx === itemIdx)
  if (!item || !item.pricedProductId) return
  const product = availableProducts.value.find((p) => p.id === item.pricedProductId)
  if (!product) return
  item.productName = product.name
  item.unitPrice = product.finalPrice || product.suggestedPrice || 0
  calcItemSubtotal(itemIdx)
}

function calcItemSubtotal(itemIdx) {
  const item = form.value.items.find((i) => i.idx === itemIdx)
  if (!item) return
  item.subtotal = Math.max(0, Number(item.quantity) * Number(item.unitPrice))
}

function calcPaymentStatus() {
  const total = orderTotal.value
  const deposit = Number(form.value.depositPaid) || 0
  form.value.balanceDue = Math.max(0, total - deposit)
  if (deposit >= total && total > 0) {
    form.value.paymentStatus = 'pago'
  } else if (deposit > 0) {
    form.value.paymentStatus = 'sinal_pago'
  } else {
    form.value.paymentStatus = 'pendente'
  }
}

watch(() => form.value.items, () => {
  calcPaymentStatus()
}, { deep: true })

watch(() => form.value.depositPaid, () => {
  calcPaymentStatus()
})

async function saveOrder() {
  if (!form.value.customerName) return
  if (form.value.items.length === 0) return

  // Combina data e hora de entrega
  let deliveryDate = form.value.deliveryDate
  if (form.value.deliveryTime && deliveryDate) {
    deliveryDate = `${deliveryDate}T${form.value.deliveryTime}:00-03:00`
  }

  savingOrder.value = true
  try {
    const orderPayload = {
      customerName: form.value.customerName,
      customerPhone: form.value.customerPhone,
      deliveryDate: deliveryDate || form.value.deliveryDate,
      status: form.value.status,
      totalAmount: orderTotal.value,
      depositPaid: Number(form.value.depositPaid) || 0,
      paymentStatus: form.value.paymentStatus,
      notes: form.value.notes,
    }

    const itemsPayload = form.value.items.map((item) => ({
      pricedProductId: item.pricedProductId || null,
      productName: item.productName,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      subtotal: item.subtotal || 0,
    }))

    let savedOrder
    if (editingOrder.value) {
      savedOrder = await ordersService.update(editingOrder.value.id, orderPayload, itemsPayload)
    } else {
      savedOrder = await ordersService.create(orderPayload, itemsPayload)
    }

    closeOrderModal()
    await loadOrders()

    // Sincroniza lançamento financeiro de entrada do pedido (sinal/pagamento)
    try {
      await ordersService.syncOrderPayment(savedOrder)
    } catch (syncErr) {
      console.warn('[OrdersManager] Não foi possível sincronizar pagamento financeiro:', syncErr.message)
    }
  } catch (err) {
    toastError(err.message || 'Erro ao salvar pedido.')
  } finally {
    savingOrder.value = false
  }
}

async function deleteOrder(id) {
  if (!confirm('Excluir este pedido?')) return
  try {
    await ordersService.remove(id)
    await loadOrders()
  } catch (err) {
    toastError(err.message || 'Erro ao excluir pedido.')
  }
}

async function advanceStatus(order) {
  const next = {
    pendente: 'em_producao',
    em_producao: 'entregue',
    entregue: 'entregue',
    cancelado: 'cancelado',
  }[order.status]
  if (!next || next === order.status) return

  // Se vai para Em Produção ou Entregue e estoque ainda não foi baixado, baixa automaticamente
  let stockMsg = ''
  if ((next === 'em_producao' || next === 'entregue') && !order.stockDeducted) {
    try {
      const result = await ordersService.deductOrderStock(order.id)
      if (result.deducted) {
        stockMsg = '\nEstoque dos insumos atualizado!'
      }
    } catch (err) {
      toastError('Erro ao baixar estoque: ' + err.message)
      return
    }
  }

  // Se vai para Cancelado e estoque já foi baixado, restaura
  if (next === 'cancelado' && order.stockDeducted) {
    try {
      await ordersService.restoreOrderStock(order.id)
      stockMsg = '\nEstoque estornado.'
    } catch (err) {
      toastError('Erro ao estornar estoque: ' + err.message)
      return
    }
  }

  try {
    await ordersService.update(order.id, {
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryDate: order.deliveryDate,
      status: next,
      totalAmount: order.totalAmount,
      depositPaid: order.depositPaid,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
    }, order.items || [])
    await loadOrders()
    // Sincroniza lançamento financeiro (pago/sinal/cancelado)
    try {
      const updatedOrder = { ...order, status: next }
      await ordersService.syncOrderPayment(updatedOrder)
    } catch (syncErr) {
      console.warn('[OrdersManager] Não foi possível sincronizar pagamento financeiro:', syncErr.message)
    }
    success(`Pedido avançado para "${statusLabel(next)}".${stockMsg}`)
  } catch (err) {
    toastError(err.message || 'Erro ao atualizar status.')
  }
}
</script>
