<template>
  <article class="bg-brand-surface border border-gray-100 rounded-xl p-4 flex flex-col min-h-[320px]">
    <!-- Foto + badges -->
    <div class="relative aspect-[4/5] mb-3 overflow-hidden rounded-lg bg-gray-100">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
        Sem foto
      </div>

      <!-- Status badge -->
      <span
        class="absolute top-2 left-2 z-10 inline-flex items-center px-2 py-1 text-[10px] font-medium rounded-full uppercase"
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

      <!-- Destaque na home -->
      <button
        @click.stop
        @click="toggleFeatured"
        class="absolute top-2 right-2 z-20 p-1.5 rounded-lg"
        :class="
          product.isFeatured
            ? 'bg-brand-secondary text-white'
            : 'bg-brand-bg/90 text-brand-text-muted border border-gray-200'
        "
        aria-label="Marcar destaque na home"
      >
        <star-icon
          :class="
            product.isFeatured
              ? 'text-brand-secondary'
              : 'text-gray-400'
          "
          class="w-4 h-4"
        />
      </button>

      <!-- Modo rápido de status -->
      <div
        v-if="editingStatus"
        class="absolute inset-0 bg-brand-bg/95 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-30 p-2"
      >
        <span class="text-[10px] font-medium text-brand-text-muted uppercase tracking-wider">
          Status da venda
        </span>
        <div class="flex gap-1">
          <button
            v-for="status in availabilityStatuses"
            :key="status.value"
            @click="setStatus(status.value)"
            :class="[
              'px-2 py-1 text-[10px] font-medium rounded border transition-colors',
              product.availabilityType === status.value
                ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
            ]"
          >
            {{ status.label }}
          </button>
        </div>
        <button
          @click="editingStatus = false"
          class="text-[10px] text-brand-text-muted underline hover:text-brand-primary"
        >
          Concluir
        </button>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="flex-1">
      <h3 class="font-medium text-brand-text-primary text-base line-clamp-2 mb-1">
        {{ product.name }}
      </h3>
      <p class="text-xs text-brand-text-muted mb-2 line-clamp-2">
        {{ product.description }}
      </p>
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="font-medium text-brand-text-primary tabular-nums">
          {{ formatPrice(product.basePrice) }}
        </span>
        <span class="text-brand-text-muted uppercase tracking-wider">
          {{ product.category }}
        </span>
      </div>
      <div class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="yieldOpt in product.yields || []"
          :key="yieldOpt"
          class="px-1.5 py-0.5 text-[10px] border border-gray-200 rounded bg-gray-50 text-brand-text-muted"
        >
          {{ yieldOpt }}
        </span>
      </div>

      <!-- Ações rápidas -->
      <div class="flex items-center gap-2 mt-auto">
        <button
          @click="editProduct"
          class="flex-1 btn-primary py-1.5 text-xs font-medium"
        >
          Editar
        </button>
        <button
          @click="editingStatus = true"
          class="flex-1 py-1.5 text-xs font-medium text-brand-text-muted hover:bg-gray-50 rounded border border-gray-200"
        >
          Ajustar status
        </button>
        <button
          @click="deleteProduct"
          class="px-1.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded"
        >
          Excluir
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { productService } from '@/services/products'
import { Star } from 'lucide-vue-next'

const props = defineProps({
  product: { type: Object, required: true },
})

const emit = defineEmits(['update-product', 'delete-product', 'edit-product'])

const starIcon = Star

const editingStatus = ref(false)

const availabilityStatuses = [
  { value: 'ready', label: 'Pronta' },
  { value: 'order', label: 'Encomenda' },
  { value: 'paused', label: 'Esgotado' },
]

const formatPrice = (price) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)

async function toggleFeatured() {
  await productService.update(props.product.id, {
    ...props.product,
    isFeatured: !props.product.isFeatured,
  })
  emit('update-product')
}

async function setStatus(status) {
  await productService.update(props.product.id, {
    ...props.product,
    availabilityType: status,
  })
  editingStatus.value = false
  emit('update-product')
}

const editProduct = () => emit('edit-product')
const deleteProduct = () => emit('delete-product')
</script>
