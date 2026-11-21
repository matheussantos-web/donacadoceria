<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const catalogHref = '/'
</script>

<template>
  <div class="min-h-screen bg-brand-bg flex flex-col">
    <!-- Barra superior limpa para telas de auth/admin -->
    <header class="bg-brand-surface border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a
          :href="catalogHref"
          class="flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 transition-colors"
        >
          <span class="font-display font-medium text-sm">← Catálogo</span>
        </a>
      </div>
      <div class="text-sm text-brand-text-muted">
        Painel Administrativo
      </div>
    </header>

    <main class="flex-1 max-w-screen-xl mx-auto px-4 py-8 w-full">
      <slot />
    </main>
  </div>
</template>
