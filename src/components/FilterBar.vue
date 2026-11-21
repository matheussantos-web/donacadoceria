<script setup>
import { categories } from '@/data/products'
import { computed } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  selectedCategory: {
    type: String,
    default: 'Todas',
  },
})

const emit = defineEmits(['filter-change'])

const handleFilterClick = (categoryId) => {
  if (categoryId === props.selectedCategory) {
    emit('filter-change', 'Todas')
  } else {
    emit('filter-change', categoryId)
  }
}

const isActive = (categoryId) => {
  return props.selectedCategory === categoryId
}

const normalizedCategories = computed(() =>
  (props.categories || [])
    .filter((item) => item != null)
    .map((item) => {
      if (typeof item === 'string') {
        return { id: item, label: item }
      }
      return {
        id: item.id ?? item.label ?? '',
        label: item.label ?? item.name ?? String(item.id ?? ''),
      }
    })
)
</script>

<template>
  <div class="sticky top-16 z-30 bg-brand-bg/95 backdrop-blur-sm border-b border-gray-100 py-3 px-4">
    <div class="max-w-screen-xl mx-auto">
      <div class="flex items-center gap-2 flex-wrap" role="group" aria-label="Filtrar por categoria">
        <!-- "Todas" button -->
                <button
                  type="button"
                  :class="[
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
                    isActive('Todas')
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-brand-surface text-brand-text-muted hover:bg-brand-primary/10 hover:text-brand-primary border border-gray-200',
                  ]"
                  :aria-pressed="isActive('Todas')"
                  @click="handleFilterClick('Todas')"
                >
                  <span>Todas</span>
                </button>

                <!-- Category chips -->
                <template v-for="category in normalizedCategories" :key="category.id">
                  <button
                    v-if="category.id !== 'Todas'"
                    type="button"
                  :class="[
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
                    isActive(category.id)
                      ? 'bg-brand-primary text-white shadow-sm ring-2 ring-brand-primary ring-offset-2'
                      : 'bg-brand-surface text-brand-text-muted hover:bg-brand-primary/10 hover:text-brand-primary border border-gray-200',
                  ]"
                  :aria-pressed="isActive(category.id)"
                  @click="handleFilterClick(category.id)"
                >
                  <span>{{ category.label }}</span>
                </button>
                </template>
      </div>

      <!-- Active filter indicator (mobile) -->
      <div v-if="selectedCategory !== 'Todas'" class="mt-2 sm:hidden flex items-center justify-between text-xs text-brand-text-muted">
        <span>Filtrando por: <strong class="text-brand-text-primary">{{ selectedCategory }}</strong></span>
        <button
          type="button"
          class="text-brand-primary hover:underline"
          @click="handleFilterClick('Todas')"
        >
          Limpar
        </button>
      </div>
    </div>
  </div>
</template>