<template>
  <footer class="border-t border-brand-mauve/30 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-brand-rose flex items-center justify-center">
            <span class="text-white font-display font-bold text-[10px]">DC</span>
          </div>
          <div>
            <div class="font-display font-bold text-lg text-brand-cacau">Dona Ca Doceria</div>
            <div class="text-[10px] text-brand-cacau/50 font-medium uppercase tracking-wider">{{ LOJA.endereco }}</div>
          </div>
        </div>

        <div class="flex items-center gap-4 text-[11px] font-medium text-brand-cacau/60">
          <a
            :href="`https://instagram.com/${LOJA.instagram.replace('@','')}`"
            target="_blank"
            rel="noopener"
            class="hover:text-brand-rose transition-colors"
          >
            {{ LOJA.instagram }}
          </a>
          <a
            :href="`https://wa.me/${LOJA.whatsapp}`"
            target="_blank"
            rel="noopener"
            class="hover:text-brand-rose transition-colors"
          >
            WhatsApp
          </a>
          <span>· {{ LOJA.horario }}</span>
        </div>

        <div class="text-[10px] text-brand-cacau/40">
          {{ new Date().getFullYear() }} Dona Ca Doceria — Feito com carinho.
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { LOJA } from '@/data/catalogo'
</script>
