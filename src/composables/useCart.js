/**
 * Composable para gerenciar a sacola de compras do cliente.
 * Persiste os itens em localStorage e expõe métodos para adicionar, remover e calcular totais.
 */
import { ref, computed } from 'vue'

const items = ref([])

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('donaca_cart')
    if (raw) items.value = JSON.parse(raw)
  } catch (_) {
    items.value = []
  }
}

function saveToStorage() {
  try {
    localStorage.setItem('donaca_cart', JSON.stringify(items.value))
  } catch (_) {
    // Silenciosamente ignora se localStorage não estiver disponível
  }
}

loadFromStorage()

export function useCart() {
  const isOpen = ref(false)

  /** Adiciona um item à sacola (ou incrementa quantidade se já existir). */
  async function addItem(item) {
    const existing = items.value.find((i) => i.id === item.id && JSON.stringify(i.selectedItems) === JSON.stringify(item.selectedItems))
    if (existing) {
      existing.quantity += 1
    } else {
      items.value.push({ ...item, quantity: 1 })
    }
    saveToStorage()
    isOpen.value = true
  }

  /** Remove um item da sacola. */
  function removeItem(index) {
    items.value.splice(index, 1)
    saveToStorage()
  }

  /** Altera a quantidade de um item. */
  function setQuantity(index, qty) {
    if (qty < 1) {
      removeItem(index)
      return
    }
    items.value[index].quantity = qty
    saveToStorage()
  }

  /** Limpa a sacola. */
  function clearCart() {
    items.value = []
    saveToStorage()
    isOpen.value = false
  }

  /** Total de itens (quantidade). */
  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  /** Subtotal em reais. */
  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + (i.basePrice + i.priceDelta) * i.quantity, 0)
  )

  /** Retorna a maior antecedência mínima (horas) entre os itens da sacola. */
  const minAdvanceHours = computed(() => {
    let max = 0
    for (const i of items.value) {
      // minAdvanceHours não é carregado pelo customizer atualmente; usamos 0 como padrão
      // quando o Supabase estiver conectado, este valor virá do produto
      const h = i.minAdvanceHours ?? 0
      if (h > max) max = h
    }
    return max
  })

  /** Formata os itens para mensagem do WhatsApp. */
  function formatItemsForWhatsApp() {
    const lines = []
    items.value.forEach((item, idx) => {
      lines.push(`*${idx + 1}. ${item.name}*`)
      lines.push(`   Qtd: ${item.quantity}`)
      lines.push(`   Valor unitário: ${formatPrice(item.basePrice)}`)
      if (item.selectedItems && item.selectedItems.length > 0) {
        lines.push('   Personalizações:')
        item.selectedItems.forEach((si) => {
          const delta = si.priceDelta > 0 ? ` (+${formatPrice(si.priceDelta)})` : ''
          lines.push(`   - ${si.group}: ${si.option}${delta}`)
        })
      }
      if (item.observations) {
        lines.push(`   Observação: ${item.observations}`)
      }
      lines.push('')
    })
    return lines.join('\n')
  }

  return {
    items,
    isOpen,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    itemCount,
    subtotal,
    minAdvanceHours,
    formatItemsForWhatsApp,
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}
