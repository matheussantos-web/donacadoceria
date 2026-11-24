/**
 * src/composables/useCart.js
 * Gerencia a sacola híbrida de pedidos com persistência em localStorage.
 */
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'donaca_cart'

const carrinho = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

watch(
  carrinho,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true }
)

export function useCart() {
  const itens = computed(() => carrinho.value)

  const totalItens = computed(() =>
    carrinho.value.reduce((s, i) => s + i.quantidade, 0)
  )

  const subtotal = computed(() =>
    carrinho.value.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0)
  )

  const temProntaEntrega = computed(() =>
    carrinho.value.some((i) => i.tipo === 'pronta-entrega')
  )
  const temEncomenda = computed(() =>
    carrinho.value.some((i) => i.tipo === 'encomenda')
  )
  const carrinhoMisto = computed(() => temProntaEntrega.value && temEncomenda.value)

  function adicionar(item) {
    const existente = carrinho.value.find(
      (i) => i.id === item.id && JSON.stringify(i.opcoes || {}) === JSON.stringify(item.opcoes || {})
    )
    if (existente) {
      existente.quantidade += item.quantidade || 1
    } else {
      carrinho.value.push({
        id: item.id,
        nome: item.nome,
        tipo: item.tipo,
        linha: item.linha || null,
        precoUnitario: item.precoUnitario || item.preco || item.precoBase || 0,
        quantidade: item.quantidade || 1,
        imagem: item.imagem,
        opcoes: item.opcoes || null,
      })
    }
  }

  function remover(id, opcoes) {
    const idx = carrinho.value.findIndex(
      (i) => i.id === id && JSON.stringify(i.opcoes || {}) === JSON.stringify(opcoes || {})
    )
    if (idx !== -1) carrinho.value.splice(idx, 1)
  }

  function alterarQuantidade(id, delta, opcoes) {
    const item = carrinho.value.find(
      (i) => i.id === id && JSON.stringify(i.opcoes || {}) === JSON.stringify(opcoes || {})
    )
    if (!item) return
    item.quantidade += delta
    if (item.quantidade <= 0) remover(id, opcoes)
  }

  function limpar() {
    carrinho.value = []
  }

  return {
    itens,
    totalItens,
    subtotal,
    temProntaEntrega,
    temEncomenda,
    carrinhoMisto,
    adicionar,
    remover,
    alterarQuantidade,
    limpar,
  }
}
