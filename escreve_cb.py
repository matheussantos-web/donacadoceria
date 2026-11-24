p = 'src/views/CakeBuilder.vue'
s5 = """<script setup>
import { ref, computed } from 'vue'
import {
  TAMANHOS, LINHAS, MASSAS, RECHEIOS, COBERTURAS, REGRAS,
} from '@/data/products'

const linhaSelecionada = ref('tradicional')
const tamanhoSelecionado = ref(TAMANHOS[0])
const massaSelecionada = ref('baunilha')
const recheiosSelecionados = ref([])
const coberturaSelecionada = ref('chantininho')
const fraseTopo = ref('')
const comVelas = ref(false)

function toggleRecheio(chave) {
  const idx = recheiosSelecionados.value.indexOf(chave)
  if (idx !== -1) recheiosSelecionados.value.splice(idx, 1)
  else if (recheiosSelecionados.value.length < 2) recheiosSelecionados.value.push(chave)
}

function recheioSelecionado(chave) {
  return recheiosSelecionados.value.includes(chave)
}

const linhaSelecionadaLabel = computed(() =>
  LINHAS.find((l) => l.chave === linhaSelecionada.value)?.label
)
const massaSelecionadaLabel = computed(() =>
  MASSAS.find((m) => m.chave === massaSelecionada.value)?.label
)
const coberturaSelecionadaLabel = computed(() =>
  COBERTURAS.find((c) => c.chave === coberturaSelecionada.value)?.label
)

const precoBase = computed(() => {
  const linha = LINHAS.find((l) => l.chave === linhaSelecionada.value)
  const produto = linha.chave === 'premium' ? 120 : 80
  return Math.round(produto * tamanhoSelecionado.value.precoMultiplicador * 100) / 100
})

const precoCobertura = computed(() => {
  const c = COBERTURAS.find((x) => x.chave === coberturaSelecionada.value)
  return c?.precoAdicional || 0
})

const precoTotal = computed(() =>
  Math.round((precoBase.value + precoCobertura.value + (comVelas.value ? 5 : 0)) * 100) / 100
)

function adicionarSacolaBolo() {
  if (!tamanhoSelecionado.value || !linhaSelecionada.value) return
  const item = {
    id: `bolo-${linhaSelecionada.value}-${tamanhoSelecionado.value.chave}`,
    nome: `Bolo Festivo ${linhaSelecionadaLabel.value} (${tamanhoSelecionado.value.label})`,
    tipo: 'encomenda',
    linha: linhaSelecionada.value,
    precoUnitario: precoTotal.value,
    quantidade: 1,
    imagem: linhaSelecionada.value === 'premium'
      ? 'https://images.unsplash.com/photo-1573825539949-5c63b487f3e5?w=400&q=80'
      : 'https://images.unsplash.com/photo-1563927757781-93672a6707d4?w=400&q=80',
    opcoes: {
      linha: linhaSelecionada.value,
      tamanho: tamanhoSelecionado.value.label,
      massa: massaSelecionada.value,
      recheios: recheiosSelecionados.value,
      cobertura: coberturaSelecionada.value,
      fraseTopo: fraseTopo.value,
      comVelas: comVelas.value,
    },
  }
  window.dispatchEvent(new CustomEvent('donaca:add-to-cart', { detail: item }))
  alert('Bolo adicionado à sacola! Revise seu pedido no ícone da sacola.')
}
</script>
"""
with open(p, 'a', encoding='utf-8') as f:
    f.write(s5)
print('parte5 ok - CakeBuilder.vue completo')
