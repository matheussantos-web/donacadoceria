<script setup>
import { Search, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  message: {
    type: String,
    default: 'Nenhum item encontrado.',
  },
  subMessage: {
    type: String,
    default: 'Tente outra categoria ou veja todos os itens.',
  },
})

const emit = defineEmits(['clear-filter'])
</script>

<template>
  <div class="py-16 px-4 text-center">
    <div class="max-w-md mx-auto">
      <!-- Illustration -->
      <div class="mx-auto mb-6 w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center">
        <Search class="w-12 h-12 text-brand-primary/60" aria-hidden="true" stroke-width="1.5" />
      </div>

      <!-- Message -->
      <h3 class="font-display font-medium text-xl text-brand-text-primary mb-2">
        {{ message }}
      </h3>

      <p class="text-brand-text-muted mb-6">
        {{ subMessage }}
      </p>

      <!-- Clear filter button -->
      <button
        type="button"
        class="btn-secondary px-6 py-3"
        @click="$emit('clear-filter')"
      >
        <RotateCcw class="w-5 h-5 mr-2" aria-hidden="true" />
        Ver todos os itens
      </button>
    </div>
  </div>
</template>