<template>
  <section class="relative pt-32 pb-12 lg:pt-48 lg:pb-20 overflow-hidden">
    <!-- Decoração de fundo: padrão sutil de corações/batedores -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-rose/10 blur-[100px] animate-float"
      />
      <div
        class="absolute bottom-0 right-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-berry/10 blur-[100px] animate-float"
        style="animation-delay: -2s"
      />
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-mauve/30 text-[11px] font-bold text-brand-rose uppercase tracking-widest mb-6 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-brand-rose" />
        {{ LOJA.selo }}
      </div>

      <h1 class="font-display text-4xl md:text-6xl lg:text-7xl text-brand-cacau font-bold mb-4 leading-tight">
        {{ LOJA.slogan }}
      </h1>

      <p class="font-script text-3xl md:text-4xl text-brand-rose/90 mb-8 italic">
        "{{ LOJA.selo }}"
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          @click="$router.push('/cardapio')"
          class="btn-brand w-full sm:w-auto"
        >
          Ver Cardápio
          <svg class="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5L6 15" />
          </svg>
        </button>
        <button
          @click="$router.push('/montar-bolo')"
          class="btn-outline w-full sm:w-auto"
        >
          Montar Meu Bolo
        </button>
      </div>

      <div class="mt-10 flex items-center justify-center gap-6 text-xs text-brand-cacau/50">
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4 4m4-4-4-4" />
          </svg>
          {{ LOJA.horario }}
        </span>
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ LOJA.endereco }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { LOJA } from '@/data/catalogo'
</script>
