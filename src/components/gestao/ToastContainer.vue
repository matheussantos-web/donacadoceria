<template>
  <div
    v-if="toasts.length"
    class="fixed z-[60] bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 pointer-events-none sm:bottom-4 sm:left-auto sm:right-6 sm:translate-x-0"
  >
    <transition-group
      name="toast"
      tag="div"
      class="flex flex-col gap-2"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        @click.self="dismiss(t.id)"
        class="pointer-events-auto flex items-start gap-3 w-full max-w-md px-4 py-3.5 rounded-2xl border border-brand-mauve/30 bg-brand-creme/90 backdrop-blur-md shadow-lg shadow-brand-rose/10 transition-all duration-300 transform hover:scale-105 cursor-pointer"
        :class="
          t.type === 'success'
            ? 'bg-brand-creme text-brand-cacau border-green-100 ring-1 ring-green-50/20'
            : t.type === 'error'
            ? 'bg-brand-creme text-brand-cacau border-rose-100 ring-1 ring-rose-50/20'
            : t.type === 'warning'
            ? 'bg-brand-creme text-brand-cacau border-amber-100 ring-1 ring-amber-50/20'
            : 'bg-brand-creme text-brand-cacau border-brand-mauve/50 ring-1 ring-brand-mauve/30'
        "
      >
        <!-- Ícone -->
        <div class="shrink-0 mt-0.5">
          <span
            :class="
              t.type === 'success'
                ? 'text-brand-berry'
                : t.type === 'error'
                ? 'text-brand-berry'
                : t.type === 'warning'
                ? 'text-brand-berry'
                : 'text-brand-rose'
            "
            class="text-xl"
            v-html="toastIcon(t.type)"
          >
          </span>
        </div>

        <!-- Conteúdo -->
        <div class="flex-1 leading-relaxed">
          <p class="text-sm font-medium">{{ t.message }}</p>
        </div>

        <!-- Barra de progresso -->
        <div class="w-full h-1 mt-2 rounded-full overflow-hidden bg-gray-100/50">
          <div
            class="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-[4000ms] ease-linear"
            :style="{ width: '0%' }"
          ></div>
        </div>

        <!-- Botão fechar -->
        <button
          @click.stop="dismiss(t.id)"
          class="shrink-0 text-gray-400 hover:text-brand-primary transition-colors p-1"
          aria-label="Fechar notificação"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  toasts: { type: Array, default: () => [] },
})
const emit = defineEmits(['dismiss'])

function dismiss(id) {
  emit('dismiss', id)
}

function toastIcon(type) {
  const icons = {
    success: `<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
    error: `<svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
    warning: `<svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    info: `<svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
  }
  return icons[type] || icons.info
}
</script>
