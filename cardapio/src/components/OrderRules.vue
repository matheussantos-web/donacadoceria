<template>
  <section id="regras" class="py-16 bg-white border-y border-brand-mauve/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="font-display text-3xl text-brand-cacau font-bold mb-4">
          Regras, Prazo e Pagamento
        </h2>
        <p class="text-brand-cacau/60 text-sm max-w-2xl mx-auto">
          Leia com carinho antes de fazer sua encomenda. Estamos aqui para tirar qualquer dúvida pelo WhatsApp.
        </p>
      </div>

      <!-- Cartão de regras -->
      <div class="rounded-2xl p-6 sm:p-8 border-2 border-brand-mauve shadow-sm relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-mauve to-transparent" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 class="font-display text-xl text-brand-berry font-bold mb-3 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Antecedência Mínima
            </h3>
            <p class="text-brand-cacau text-sm leading-relaxed">
              Encomendas devem ser feitas com no mínimo
              <span class="font-bold text-brand-cacau">{{ REGRAS.antecedenciaMinimaDias }} dias</span>
              de antecedência.
            </p>
          </div>
          <div>
            <h3 class="font-display text-xl text-brand-berry font-bold mb-3 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pagamento
            </h3>
            <p class="text-brand-cacau text-sm leading-relaxed">
              <span class="font-bold text-brand-cacau">{{ REGRAS.entradaPercentual }}% de entrada</span> no ato da encomenda e o restante na entrega.
              <br class="hidden sm:block" />
              Formas aceitas:
              <span class="font-semibold text-brand-rose">
                {{ REGRAS.formasPagamento.join(' • ') }}
              </span>
            </p>
          </div>
        </div>

        <h3 class="font-display text-lg text-brand-cacau font-bold mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Instruções Gerais
        </h3>
        <ol class="list-decimal list-inside text-brand-cacau/80 text-sm leading-relaxed space-y-2">
          <li v-for="(instrucao, i) in REGRAS.instrucoes" :key="i">{{ instrucao }}</li>
        </ol>
      </div>

      <div class="mt-8 text-center">
        <button
          @click="$router.push('/montar-bolo')"
          class="inline-flex items-center gap-2 btn-brand text-sm"
        >
          Começar Minha Encomenda
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5L6 15" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { REGRAS } from '@/data/catalogo'
</script>
