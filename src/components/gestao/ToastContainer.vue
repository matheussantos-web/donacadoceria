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
        class="pointer-events-auto flex items-start gap-3 w-full max-w-md px-4 py-3.5 rounded-2xl border shadow-2xl shadow-rose-900/10 transition-all duration-300 transform hover:scale-105 cursor-pointer"
        :class="
          t.type === 'success'
            ? 'bg-white border-green-100 text-green-900 ring-1 ring-green-50/20'
            : t.type === 'error'
            ? 'bg-white border-rose-100 text-rose-900 ring-1 ring-rose-50/20'
            : t.type === 'warning'
            ? 'bg-white border-amber-100 text-amber-900 ring-1 ring-amber-50/20'
            : 'bg-white border-rose-100 text-brand-text-primary ring-1 ring-rose-50/20'
        "
      >
        <!-- Ícone -->
        <div class="shrink-0 mt-0.5">
          <span
            :class="
              t.type === 'success'
                ? 'text-green-500'
                : t.type === 'error'
                ? 'text-rose-500'
                : t.type === 'warning'
                ? 'text-amber-500'
                : 'text-brand-primary'
            "
            class="text-xl"
          >
            {{ toastIcon(t.type) }}
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
          <span class="text-xs">✕</span>
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
    success: '✔',
    error: '✖',
    warning: '⚠',
    info: 'ℹ',
  }
  return icons[type] || icons.info
}
</script>
