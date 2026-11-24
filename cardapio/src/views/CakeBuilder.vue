<template>
  <div class="min-h-screen bg-brand-creme pt-20 pb-12">
    <AppHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav class="flex items-center gap-2 text-[11px] font-medium text-brand-cacau/50 mb-8">
        <span class="text-brand-cacau">Início</span>
        <span>/</span>
        <router-link to="/" class="hover:text-brand-rose">Cardápio</router-link>
        <span>/</span>
        <span class="text-brand-berry font-bold">Monte seu Bolo</span>
      </nav>

      <CakeBuilder />
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import CakeBuilder from '@/components/CakeBuilder.vue'
</script>
