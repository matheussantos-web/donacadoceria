<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center pb-4" @click.self="closeDrawer">
    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      @click="closeDrawer"
    ></div>

    <!-- Drawer -->
    <div
      v-if="isOpen"
      class="w-full max-w-md bg-brand-surface border-t border-gray-100 rounded-t-2xl shadow-2xl z-50 flex flex-col"
      @click.stop
    >
      <!-- Cabeçalho -->
      <div class="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-display font-medium text-lg text-brand-text-primary">
          Sua sacola
        </h3>
        <button
          @click="closeDrawer"
          class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
          aria-label="Fechar"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Itens -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="items.length === 0" class="text-center py-12">
          <p class="text-brand-text-muted">Sua sacola está vazia.</p>
          <button
            @click="closeDrawer"
            class="mt-4 btn-secondary px-6 py-2 text-sm font-medium"
          >
            Continuar comprando
          </button>
        </div>

        <div v-else>
          <div
            v-for="(item, idx) in items"
            :key="idx"
            class="flex gap-3 mb-4"
          >
            <!-- Foto miniatura -->
            <div class="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Sem foto
              </div>
            </div>

            <!-- Detalhes -->
            <div class="flex-1">
              <h4 class="font-medium text-brand-text-primary text-sm line-clamp-2">
                {{ item.name }}
              </h4>
              <div class="flex items-baseline gap-1 mt-1">
                <span class="text-brand-primary tabular-nums text-sm font-medium">
                  {{ formatPrice((item.basePrice + item.priceDelta) * item.quantity) }}
                </span>
              </div>

              <div v-if="item.selectedItems && item.selectedItems.length" class="mt-1">
                <div
                  v-for="(si, siIdx) in item.selectedItems"
                  :key="siIdx"
                  class="text-[10px] text-brand-text-muted flex gap-1"
                >
                  <span class="font-medium">{{ si.group }}:</span>
                  <span>{{ si.option }}</span>
                  <span v-if="si.priceDelta > 0" class="text-brand-secondary">
                    (+{{ formatPrice(si.priceDelta) }})
                  </span>
                </div>
              </div>

              <div v-if="item.observations" class="text-[10px] text-brand-text-muted mt-1 italic">
                "{{ item.observations }}"
              </div>

              <!-- Controle de quantidade -->
              <div class="flex items-center gap-2 mt-2">
                <button
                  @click="setQuantity(idx, item.quantity - 1)"
                  class="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-brand-text-muted hover:bg-gray-50"
                >
                  −
                </button>
                <span class="w-6 text-center text-xs font-medium text-brand-text-primary">
                  {{ item.quantity }}
                </span>
                <button
                  @click="setQuantity(idx, item.quantity + 1)"
                  class="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-brand-text-muted hover:bg-gray-50"
                >
                  +
                </button>
                <button
                  @click="removeItem(idx)"
                  class="ml-2 text-[10px] text-red-600 hover:text-red-800"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- Alerta carrinho misto -->
        <div v-if="carrinhoMisto" class="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
          <div class="flex items-start gap-2">
            <svg class="w-4 h-4 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-xs text-amber-800 leading-relaxed">
              Seu carrinho mistura itens de <strong>Pronta Entrega</strong> e <strong>Sob Encomenda</strong>.
              <br />Os prazos são diferentes e serão alinhados no WhatsApp.
            </div>
          </div>
        </div>

      <!-- Resumo -->
      <div class="p-5 border-t border-gray-100 bg-brand-bg">
        <div class="flex justify-between mb-3">
          <span class="text-brand-text-muted text-sm">Subtotal</span>
          <span class="text-brand-primary tabular-nums text-sm font-medium">
            {{ subtotal }}
          </span>
        </div>
        <div class="text-[10px] text-brand-text-muted mb-4">
          {{ temEncomenda.value ? 'Produtos sob encomenda: ' + REGRAS.entradaPercentual + '% de entrada no ato e o restante na entrega.' : 'Pronta entrega: pagamento na entrega.' }}
          O prazo mínimo de entrega é calculado com base na maior antecedência dos itens da sacola.
        </div>

        <!-- Tipo de recebimento -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-brand-text-muted mb-2 uppercase tracking-wider">
            Tipo de recebimento
          </label>
          <div class="flex gap-2">
            <button
              :class="[
                'px-3 py-2 rounded border text-sm font-medium transition-colors',
                deliveryType === 'pickup'
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                  : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
              ]"
              @click="deliveryType = 'pickup'"
            >
              Retirada no Ateliê
            </button>
            <button
              :class="[
                'px-3 py-2 rounded border text-sm font-medium transition-colors',
                deliveryType === 'delivery'
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                  : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
              ]"
              @click="deliveryType = 'delivery'"
            >
              Entrega (Delivery)
            </button>
          </div>
        </div>

        <!-- Agendamento -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-brand-text-muted mb-2 uppercase tracking-wider">
            Data e turno
          </label>
          <input
            :min="minDate"
            type="date"
            v-model="scheduledDate"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
          />
          <div class="flex gap-2 mt-2">
            <button
              v-for="window in timeWindows"
              :key="window"
              @click="selectedTimeWindow = window"
              :class="[
                'px-3 py-1 rounded border text-[10px] font-medium transition-colors whitespace-nowrap',
                selectedTimeWindow === window
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                  : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
              ]"
            >
              {{ window }}
            </button>
          </div>
          <p v-if="minAdvanceHours > 0" class="text-[10px] text-brand-text-muted mt-1">
            Antecedência mínima: {{ minAdvanceHours }}h
          </p>
        </div>

        <!-- Pagamento -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-brand-text-muted mb-2 uppercase tracking-wider">
            Forma de pagamento
          </label>
          <div class="flex gap-2">
            <button
              :class="[
                'px-3 py-2 rounded border text-sm font-medium transition-colors',
                paymentMethod === 'pix'
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                  : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
              ]"
              @click="paymentMethod = 'pix'"
            >
              Pix
            </button>
            <button
              :class="[
                'px-3 py-2 rounded border text-sm font-medium transition-colors',
                paymentMethod === 'card'
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                  : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
              ]"
              @click="paymentMethod = 'card'"
            >
              Cartão
            </button>
            <button
              :class="[
                'px-3 py-2 rounded border text-sm font-medium transition-colors',
                paymentMethod === 'cash'
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                  : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
              ]"
              @click="paymentMethod = 'cash'"
            >
              Dinheiro
            </button>
          </div>
          <p v-if="paymentMethod === 'cash'" class="text-[10px] text-brand-text-muted mt-1">
            Informe o troco no campo de observações.
          </p>
        </div>

        <!-- Observações do pedido -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-brand-text-muted mb-1">
            Observações do pedido
          </label>
          <textarea
            v-model="orderNotes"
            rows="2"
            placeholder="Ex: Sem canela, escrever 'Parabéns Ana'..."
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
          ></textarea>
        </div>

        <!-- Botão enviar -->
        <button
          @click="sendToWhatsApp"
          class="w-full btn-primary py-3 text-sm font-medium"
        >
          Enviar Pedido pelo WhatsApp
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCart } from '@/composables/useCart'
import { formatPrice, REGRAS } from '@/data/products'
import { getWhatsAppUrl, isWhatsAppConfigured } from '@/config/store'
import { X, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const { items, addItem, removeItem, setQuantity, clearCart, itemCount, subtotal, minAdvanceHours, formatItemsForWhatsApp, carrinhoMisto, temProntaEntrega, temEncomenda } = useCart()

const deliveryType = ref('pickup')
const scheduledDate = ref('')
const selectedTimeWindow = ref('')
const paymentMethod = ref('pix')
const orderNotes = ref('')

const timeWindows = ['Manhã (09h–12h)', 'Tarde (14h–18h)', 'Noite (18h–20h)']

const minDate = computed(() => {
  const today = new Date()
  const future = new Date(today.getTime() + REGRAS.antecedenciaMinimaDias * 24 * 60 * 60 * 1000)
  return future.toISOString().split('T')[0]
})

function closeDrawer() {
  emit('close')
}

async function sendToWhatsApp() {
  if (items.value.length === 0) return

  if (!isWhatsAppConfigured()) {
    alert('WhatsApp não configurado. Entre em contato com a Dona Ca Doceria diretamente.')
    return
  }

  const datePart = scheduledDate
    ? new Date(scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')
    : 'A combinar'
  const timePart = selectedTimeWindow.value ? `\nTurno: ${selectedTimeWindow.value}` : ''
  const deliveryPart =
    deliveryType.value === 'pickup'
      ? `\nRetirada: Ateliê (${datePart})`
      : `\nDelivery: Endereço a informar`

  const advanceWarning = minAdvanceHours.value > 0
    ? `\nItens sob encomenda: prazo mínimo de ${minAdvanceHours.value}h.`
    : ''

  const itemsText = formatItemsForWhatsApp()

  const message = [
    '*Novo Pedido — Dona Ca Doceria*',
    '',
    itemsText,
    `*Subtotal:* ${subtotal.value}`,
    '',
    deliveryPart,
    timePart,
    `*Pagamento:* ${paymentMethod.value === 'pix' ? 'Pix' : paymentMethod.value === 'card' ? 'Cartão' : 'Dinheiro'}`,
    advanceWarning,
    orderNotes.value ? `\n*Observações:* ${orderNotes.value}` : '',
    '',
    'Obrigado por escolher a Dona Ca Doceria!',
  ]
    .filter(Boolean)
    .join('\n')

  const url = getWhatsAppUrl(message)
  window.open(url, '_blank', 'noopener,noreferrer')

  // Limpa sacola após enviar
  clearCart()
  closeDrawer()
}
</script>
