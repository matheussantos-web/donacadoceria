<template>
  <aside
    class="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white border-l border-brand-mauve/30 shadow-2xl transform translate-x-full transition-transform duration-300"
    :class="{ 'translate-x-0': aberta }"
    @click.self="fechar"
  >
    <!-- Overlay -->
    <div
      v-if="aberta"
      class="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
      @click="fechar"
    />

    <div class="absolute top-0 right-0 p-4 z-50">
      <button @click="fechar" class="text-brand-cacau/50 hover:text-brand-rose transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="relative z-50 flex flex-col h-full">
      <div class="p-6 border-b border-brand-mauve/20">
        <h2 class="font-display text-xl text-brand-cacau font-bold flex items-center gap-2">
          <svg class="w-5 h-5 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 110 4 2 2 0 010-4z" />
          </svg>
          Sacola
        </h2>
        <p class="text-xs text-brand-cacau/60 mt-1">
          {{ itens.length }} item{{ itens.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Carrinho vazio -->
        <div v-if="itens.length === 0" class="text-center py-10">
          <div class="w-16 h-16 rounded-full bg-brand-creme flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-brand-mauve/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p class="text-brand-cacau text-sm font-medium">Sua sacola está vazia.</p>
          <p class="text-[10px] text-brand-cacau/50 mt-1">Adicione doces ou monte seu bolo.</p>
          <button
            @click="fechar"
            class="mt-5 btn-brand text-xs py-2"
          >
            Ver Cardápio
          </button>
        </div>

        <!-- Itens -->
        <div v-else>
          <div
            v-for="item in itens"
            :key="item.id + JSON.stringify(item.opcoes)"
            class="flex gap-3 bg-brand-creme rounded-xl p-3 border border-brand-mauve/10"
          >
            <img
              :src="item.imagem"
              :alt="item.nome"
              class="w-16 h-16 object-cover rounded-lg"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-brand-cacau text-sm leading-tight line-clamp-2">
                {{ item.nome }}
              </h4>
              <p class="text-[10px] text-brand-cacau/50 mt-0.5">
                {{ item.tipo === 'encomenda' ? 'Sob encomenda' : 'Pronta entrega' }}
              </p>
              <div class="mt-2 flex items-center justify-between">
                <span class="price text-xs">{{ formatPrice(item.precoUnitario) }}</span>
                <div class="flex items-center gap-2">
                  <button
                    @click="alterar(item.id, -1, item.opcoes)"
                    class="w-6 h-6 rounded border border-brand-mauve text-brand-cacau text-[10px] flex items-center justify-center hover:bg-brand-rose hover:text-white transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span class="w-4 text-center font-bold text-[10px]">{{ item.quantidade }}</span>
                  <button
                    @click="alterar(item.id, 1, item.opcoes)"
                    class="w-6 h-6 rounded border border-brand-mauve text-brand-cacau text-[10px] flex items-center justify-center hover:bg-brand-rose hover:text-white transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Alerta carrinho misto -->
          <div
            v-if="carrinhoMisto"
            class="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-4"
          >
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-xs text-amber-800 leading-relaxed">
                Seu carrinho mistura itens de <strong>Pronta Entrega</strong> e <strong>Sob Encomenda</strong>.
                <br />Os prazos são diferentes e serão alinhados no WhatsApp.
              </div>
            </div>
          </div>

          <!-- Resumo -->
          <div class="bg-white rounded-xl p-4 border border-brand-mauve/20 shadow-sm mt-6">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-brand-cacau/60">Subtotal</span>
              <span class="font-bold text-brand-cacau tabular-nums">{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="border-t border-brand-mauve/20 pt-3">
              <p class="text-[10px] text-brand-cacau/60 mb-2">
                Sob encomenda: 50% de entrada. Pagamento: Pix, Dinheiro ou Cartão.
              </p>
              <button
                @click="irCheckout"
                :disabled="subtotal === 0"
                class="w-full btn-brand text-sm font-bold py-3 disabled:opacity-50 disabled:pointer-events-none"
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'

const router = useRouter()
const {
  itens,
  totalItens,
  subtotal,
  carrinhoMisto,
  adicionar,
  remover,
  alterarQuantidade,
  limpar,
} = useCart()

const aberta = ref(true)

const fechar = () => { aberta.value = false }
const alterar = (id, delta, opcoes) => alterarQuantidade(id, delta, opcoes)

const irCheckout = () => {
  fechar()
  router.push({ name: 'Checkout' })
}

const formatPrice = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
</script>
