<template>
  <article
    class="card-product group cursor-pointer"
    @click="abrirDetalhe"
    :class="{ 'pronta-entrega': produto.tipo === 'pronta-entrega' }"
  >
    <div class="relative overflow-hidden rounded-xl h-48 mb-4">
      <img
        :src="produto.imagem"
        :alt="produto.nome"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <span
          class="bg-white/90 backdrop-blur text-brand-cacau text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
        >
          {{ produto.tipo === 'pronta-entrega' ? 'Pronta Entrega' : 'Sob Encomenda' }}
        </span>
      </div>
      <div
        v-if="produto.combo"
        class="absolute top-2 left-2 bg-brand-berry text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md"
      >
        {{ produto.combo.quantidade }} por R$ {{ produto.combo.preco.toFixed(2) }}
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-display font-bold text-base text-brand-cacau leading-tight line-clamp-1">
          {{ produto.nome }}
        </h3>
        <span class="price text-sm">{{ formatPrice(produto.precoBase || produto.preco) }}</span>
      </div>
      <p class="text-xs text-brand-cacau/60 mb-3 line-clamp-2">{{ produto.descricao }}</p>

      <div class="flex items-center gap-2 text-xs">
        <span
          v-for="tag in produto.tags"
          :key="tag"
          class="badge"
          :class="{
            'bg-brand-rose/10 text-brand-rose border-brand-rose/20': tag.includes('Pronta'),
            'bg-brand-berry/10 text-brand-berry border-brand-berry/20': tag.includes('Premium'),
            'bg-brand-mauve/10 text-brand-cacau border-brand-mauve/20': tag.includes('Tradicional'),
          }"
        >
          {{ tag }}
        </span>
      </div>

      <button
        @click.stop="adicionarSacola"
        class="mt-3 w-full btn-brand text-xs py-2"
      >
        Adicionar
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useCart } from '@/composables/useCart'

const props = defineProps({
  produto: { type: Object, required: true },
})

const emit = defineEmits(['adicionar'])

const { adicionar: adicionarCarrinho } = useCart()

const abrirDetalhe = () => {
  if (props.produto.tipo === 'encomenda') {
    emit('adicionar', props.produto)
  }
}

const adicionarSacola = () => {
  const item = {
    id: props.produto.id,
    nome: props.produto.nome,
    tipo: props.produto.tipo,
    linha: props.produto.linha || null,
    precoUnitario: props.produto.precoUnitario || props.produto.preco || props.produto.precoBase || 0,
    quantidade: 1,
    imagem: props.produto.imagem,
  }
  adicionarCarrinho(item)
  emit('adicionar', item)
}

const formatPrice = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
</script>
