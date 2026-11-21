<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="closeModal">
    <div
      class="bg-brand-surface border border-gray-100 rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
      @click.stop
    >
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-display font-medium text-lg text-brand-text-primary">
          {{ product.name }}
        </h3>
        <button
          @click="closeModal"
          class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
          aria-label="Fechar"
        >
          <span class="text-2xl">✕</span>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Galeria de fotos -->
        <div class="relative aspect-[4/5] mb-4 overflow-hidden rounded-xl bg-gray-100">
          <img
            v-if="coverImage"
            :src="coverImage"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Sem foto
          </div>

          <!-- Vídeo curto opcional -->
          <video
            v-if="product.videoUrl"
            class="absolute inset-0 w-full h-full object-cover"
            playsinline
            muted
            loop
            poster=""
          >
            <source :src="product.videoUrl" type="video/mp4" />
          </video>

          <!-- Badge de status -->
          <span
            class="absolute top-2 left-2 z-10 inline-flex items-center px-2.5 py-1 text-[10px] font-medium rounded-full uppercase"
            :class="{
              'bg-brand-accent text-white': product.availabilityType === 'ready',
              'bg-brand-secondary text-white': product.availabilityType === 'order',
              'bg-gray-400 text-white': product.availabilityType === 'paused',
            }"
          >
            {{
              product.availabilityType === 'ready'
                ? 'Pronta Entrega'
                : product.availabilityType === 'order'
                ? 'Sob Encomenda'
                : 'Esgotado'
            }}
          </span>
        </div>

        <!-- Preço dinâmico -->
        <div class="text-center">
          <span class="font-display font-medium text-2xl text-brand-text-primary tabular-nums">
            {{ formatPrice(totalPrice) }}
          </span>
          <span v-if="priceDelta > 0" class="text-brand-secondary text-sm ml-1">
            (+{{ formatPrice(priceDelta) }})
          </span>
        </div>

        <!-- Grupos de opções -->
        <div v-for="(group, gi) in optionGroups" :key="gi" class="space-y-3">
          <h4 class="font-medium text-brand-text-primary text-sm mb-2">
            {{ group.title }}
          </h4>
          <div
            v-if="group.type === 'single'"
            class="flex flex-wrap gap-2"
          >
            <button
              v-for="(opt, oi) in group.options"
              :key="oi"
              @click="selectSingleOption(gi, oi)"
              :class="[
                'px-3 py-2 text-xs font-medium rounded border transition-colors whitespace-nowrap',
                selectedOptions[gi] === oi
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                  : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
                !opt.available ? 'opacity-50 cursor-not-allowed' : '',
              ]"
              :disabled="!opt.available"
            >
              {{ opt.name }}
              <span v-if="opt.priceDelta > 0" class="text-[10px] ml-1">+{{ formatPrice(opt.priceDelta) }}</span>
            </button>
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <label
              v-for="(opt, oi) in group.options"
              :key="oi"
              class="cursor-pointer flex items-center gap-2"
              :class="{ 'opacity-50': !opt.available }"
            >
              <input
                type="checkbox"
                :checked="isMultiSelected(gi, oi)"
                @change="toggleMultiOption(gi, oi)"
                :disabled="!opt.available"
                class="rounded border-brand-primary text-brand-primary focus:ring-brand-primary"
              />
              <span class="text-xs">{{ opt.name }}</span>
              <span v-if="opt.priceDelta > 0" class="text-[10px] text-brand-secondary ml-1">
                +{{ formatPrice(opt.priceDelta) }}
              </span>
            </label>
          </div>
          <p v-if="group.required && !groupHasSelection(gi)" class="text-[10px] text-red-600 mt-1">
            Selecione ao menos uma opção.
          </p>
        </div>

        <!-- Observações -->
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Observações (ex: frase no topo do bolo)
          </label>
          <textarea
            v-model="observations"
            rows="2"
            placeholder="Escrever 'Parabéns Ana' no prato..."
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          ></textarea>
        </div>

        <!-- Botão adicionar à sacola -->
        <button
          @click="addToCart"
          :disabled="!canAddToCart || addingToCart"
          class="w-full btn-primary py-3 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
        >
          {{ addingToCart ? 'Adicionando...' : 'Adicionar à sacola' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatPrice } from '@/data/products'
import { useCart } from '@/composables/useCart'

const props = defineProps({
  product: { type: Object, required: true },
})

const emit = defineEmits(['added'])

const { addItem, isOpen: cartIsOpen } = useCart()

const coverImage = computed(() => {
  const imgs = props.product.images || []
  return imgs.length > 0 ? imgs[0] : (props.product.imageUrl || '')
})

const optionGroups = computed(() => props.product.optionGroups || [])

const selectedOptions = ref({}) // groupIndex -> optionIndex (single)
const multiSelections = ref({}) // groupIndex -> Set of optionIndex (multiple)
const observations = ref('')
const addingToCart = ref(false)

const availabilityStatuses = [
  { value: 'ready', label: 'Pronta Entrega' },
  { value: 'order', label: 'Sob Encomenda' },
  { value: 'paused', label: 'Esgotado' },
]

const priceDelta = computed(() => {
  let delta = 0
  optionGroups.value.forEach((group, gi) => {
    if (group.type === 'single') {
      const oi = selectedOptions.value[gi]
      if (oi !== undefined) delta += Number(group.options[oi]?.price_delta || 0)
    } else {
      const selected = multiSelections.value[gi] || new Set()
      selected.forEach(oi => {
        delta += Number(group.options[oi]?.price_delta || 0)
      })
    }
  })
  return delta
})

const totalPrice = computed(() => Number(props.product.basePrice) + priceDelta.value)

const canAddToCart = computed(() => {
  if (props.product.availabilityType === 'paused') return false
  // Verifica grupos obrigatórios
  for (const group of optionGroups.value) {
    if (group.required) {
      if (group.type === 'single') {
        if (selectedOptions.value[group.id] === undefined) return false
      } else {
        const selected = multiSelections.value[group.id] || new Set()
        if (selected.size === 0) return false
      }
    }
  }
  return true
})

function selectSingleOption(gi, oi) {
  const group = optionGroups.value[gi]
  selectedOptions.value = { ...selectedOptions.value, [group.id]: oi }
}

function isMultiSelected(gi, oi) {
  const group = optionGroups.value[gi]
  const selected = multiSelections.value[group.id] || new Set()
  return selected.has(oi)
}

function toggleMultiOption(gi, oi) {
  const group = optionGroups.value[gi]
  const selected = new Set(multiSelections.value[group.id] || [])
  if (selected.has(oi)) {
    selected.delete(oi)
  } else {
    if (group.maxChoices && selected.size >= group.maxChoices) return
    selected.add(oi)
  }
  multiSelections.value = { ...multiSelections.value, [group.id]: selected }
}

function groupHasSelection(gi) {
  const group = optionGroups.value[gi]
  if (group.type === 'single') {
    return selectedOptions.value[group.id] !== undefined
  } else {
    const selected = multiSelections.value[group.id] || new Set()
    return selected.size > 0
  }
}

async function addToCart() {
  if (!canAddToCart.value) return
  addingToCart.value = true

  const selectedItems = []
  optionGroups.value.forEach((group) => {
    if (group.type === 'single') {
      const oi = selectedOptions.value[group.id]
      if (oi !== undefined) {
        selectedItems.push({
          group: group.title,
          option: group.options[oi].name,
          priceDelta: Number(group.options[oi].price_delta),
        })
      }
    } else {
      const selected = multiSelections.value[group.id] || new Set()
      selected.forEach(oi => {
        selectedItems.push({
          group: group.title,
          option: group.options[oi].name,
          priceDelta: Number(group.options[oi].price_delta),
        })
      })
    }
  })

  await addItem({
    id: props.product.id,
    name: props.product.name,
    basePrice: Number(props.product.basePrice),
    category: props.product.category,
    imageUrl: coverImage.value,
    quantity: 1,
    observations: observations.value,
    selectedItems,
    priceDelta: priceDelta.value,
  })

  addingToCart.value = false
  emit('added')
}

function closeModal() {
  emit('close')
}
</script>
