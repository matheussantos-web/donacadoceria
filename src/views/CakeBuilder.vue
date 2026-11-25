<template>
  <div class="min-h-screen bg-brand-creme pt-20 pb-12">
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div class="border-2 border-brand-mauve rounded-2xl p-6 sm:p-8 bg-brand-white shadow-sm">
        <div class="flex items-start gap-3 mb-4">
          <svg class="w-5 h-5 text-brand-rose flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-display font-bold text-lg text-brand-cacau mb-1">Regras da Encomenda</h3>
            <p class="text-sm text-brand-cacau/70 leading-relaxed">
              Encomendas devem ser feitas com no mínimo <span class="font-semibold text-brand-cacau">{{ REGRAS.antecedenciaMinimaDias }} dias</span> de antecedência.
              <br class="hidden sm:block" />
              Pagamento: <span class="font-semibold text-brand-cacau">{{ REGRAS.entradaPercentual }}% de entrada</span> no ato da encomenda e o restante na entrega.
              Formas: <span class="font-semibold text-brand-rose">{{ REGRAS.formasPagamento.join(" • ") }}</span>.
            </p>
          </div>
        </div>
        <ul class="list-disc list-inside text-sm text-brand-cacau/70 space-y-1">
          <li v-for="(instrucao, i) in REGRAS.instrucoes" :key="i">{{ instrucao }}</li>
        </ul>
      </div>
    </section>
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h2 class="font-display text-3xl text-brand-cacau font-bold mb-2">Monte seu Bolo Personalizado</h2>
      <p class="text-brand-cacau/60 text-sm mb-8 max-w-lg">Escolha cada detalhe do seu bolo festivo. O preço é calculado automaticamente conforme você monta.</p>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8 space-y-6">
          <section class="card p-5">
            <h3 class="font-display font-bold text-lg text-brand-cacau mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-rose text-white text-[10px] flex items-center justify-center">1</span>
              Linha do Bolo
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="linha in LINHAS"
                :key="linha.chave"
                @click="linhaSelecionada = linha.chave"
                class="px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': linhaSelecionada === linha.chave,
                  'bg-brand-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': linhaSelecionada !== linha.chave,
                }"
              >
                <div class="font-bold">{{ linha.label }}</div>
                <div class="text-[10px] opacity-80">{{ linha.descricao }}</div>
              </button>
            </div>
          </section>
          <section class="card p-5">
            <h3 class="font-display font-bold text-lg text-brand-cacau mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-rose text-white text-[10px] flex items-center justify-center">2</span>
              Tamanho
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button
                v-for="t in TAMANHOS"
                :key="t.chave"
                @click="tamanhoSelecionado = t"
                class="aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': tamanhoSelecionado?.chave === t.chave,
                  'bg-brand-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': tamanhoSelecionado?.chave !== t.chave,
                }"
              >
                <span class="font-display font-bold text-sm">{{ t.label }}</span>
                <span class="text-[10px]">{{ t.serve }}</span>
              </button>
            </div>
          </section>

          <section class="card p-5">
            <h3 class="font-display font-bold text-lg text-brand-cacau mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-rose text-white text-[10px] flex items-center justify-center">3</span>
              Massa
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="m in MASSAS"
                :key="m.chave"
                @click="massaSelecionada = m.chave"
                class="p-3 rounded-xl border transition-all duration-200 text-sm font-medium"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': massaSelecionada === m.chave,
                  'bg-brand-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': massaSelecionada !== m.chave,
                }"
              >
                {{ m.label }}
              </button>
            </div>
          </section>

          <section class="card p-5">
            <h3 class="font-display font-bold text-lg text-brand-cacau mb-2 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-rose text-white text-[10px] flex items-center justify-center">4</span>
              Recheios (até 2 sabores)
            </h3>
            <p class="text-xs text-brand-cacau/50 mb-3">Escolha até 2 sabores para as camadas entre os 3 discos de massa.</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="r in RECHEIOS"
                :key="r.chave"
                @click="toggleRecheio(r.chave)"
                class="p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 min-h-[80px]"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': recheioSelecionado(r.chave),
                  'bg-brand-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': !recheioSelecionado(r.chave),
                  'opacity-50 cursor-not-allowed': recheiosSelecionados.length >= 2 && !recheioSelecionado(r.chave),
                }"
                :disabled="recheiosSelecionados.length >= 2 && !recheioSelecionado(r.chave)"
              >
                {{ r.label }}
              </button>
            </div>
            <div class="mt-2 text-[10px] text-brand-cacau/50 flex items-center gap-1">
              <span class="font-bold text-brand-cacau">{{ recheiosSelecionados.length }}</span>/2 selecionados
            </div>
          </section>

          <section class="card p-5">
            <h3 class="font-display font-bold text-lg text-brand-cacau mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-rose text-white text-[10px] flex items-center justify-center">5</span>
              Cobertura / Acabamento
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="c in COBERTURAS"
                :key="c.chave"
                @click="coberturaSelecionada = c.chave"
                class="p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 text-sm font-medium"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': coberturaSelecionada === c.chave,
                  'bg-brand-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': coberturaSelecionada !== c.chave,
                }"
              >
                {{ c.label }}
              </button>
            </div>
          </section>

          <section class="card p-5">
            <h3 class="font-display font-bold text-lg text-brand-cacau mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-brand-rose text-white text-[10px] flex items-center justify-center">6</span>
              Adicionais e Frase no Topo
            </h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-brand-cacau/80 uppercase tracking-wider mb-1.5">Mensagem personalizada (opcional)</label>
                <textarea
                  v-model="fraseTopo"
                  rows="3"
                  class="input-field"
                  placeholder='Ex: "Feliz Aniversário, Maria!"'
                />
              </div>
              <div class="flex items-start gap-3 pt-1">
                <input
                  id="vela"
                  v-model="comVelas"
                  type="checkbox"
                  class="mt-0.5 w-4 h-4 rounded border-brand-mauve text-brand-rose focus:ring-brand-rose"
                />
                <label for="vela" class="text-sm text-brand-cacau cursor-pointer">Adicionar velas (+ R$ 5,00)</label>
              </div>
            </div>
          </section>
        </div>
        <div class="lg:col-span-4">
          <div
            class="sticky top-6 bg-brand-white rounded-2xl p-6 shadow-lg border border-brand-mauve/20 max-h-[calc(100vh-12px)] overflow-y-auto"
          >
            <div class="mb-6">
              <Cake3DPreview
                :size="tamanhoSelecionado?.chave"
                :line="linhaSelecionada"
                :batter="batterSelecionado"
                :fillings="recheiosSelecionadosMapeados"
                :frosting="frostingSelecionado"
                :topper-text="fraseTopo"
              />
            </div>

            <div class="flex items-center justify-between mb-4">
              <h3 class="font-display font-bold text-xl text-brand-cacau">Resumo do Bolo</h3>
              <span class="font-display font-bold text-xl text-brand-berry tabular-nums">R$ {{ precoTotal }}</span>
            </div>

            <div class="space-y-4 text-sm mb-6">
              <div class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Linha</span>
                <span class="font-medium text-brand-cacau">{{ linhaSelecionadaLabel }}</span>
              </div>
              <div class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Tamanho</span>
                <span class="font-medium text-brand-cacau">{{ tamanhoSelecionado?.label }} ({{ tamanhoSelecionado?.serve }})</span>
              </div>
              <div class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Massa</span>
                <span class="font-medium text-brand-cacau">{{ massaSelecionadaLabel }}</span>
              </div>
              <div class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Recheios</span>
                <span class="font-medium text-brand-cacau">{{ recheiosSelecionados.length ? recheiosSelecionados.join(' + ') : '—' }}</span>
              </div>
              <div class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Cobertura</span>
                <span class="font-medium text-brand-cacau">{{ coberturaSelecionadaLabel }}</span>
              </div>
              <div v-if="fraseTopo" class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Frase no topo</span>
                <span class="font-medium text-brand-cacau italic">"{{ fraseTopo }}"</span>
              </div>
              <div v-if="comVelas" class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Velas</span>
                <span class="font-medium text-brand-cacau">+ R$ 5,00</span>
              </div>
            </div>

            <div class="bg-brand-creme rounded-xl p-4 border border-brand-mauve/20">
              <div class="text-[10px] font-bold uppercase tracking-wider text-brand-rose mb-1">Estrutura padrão</div>
              <p class="text-xs text-brand-cacau/70 leading-relaxed">
                10 cm de altura · 3 discos de massa · 2 camadas de recheio
              </p>
            </div>

            <button
              @click="adicionarSacolaBolo"
              :disabled="!tamanhoSelecionado || !linhaSelecionada"
              class="mt-6 w-full btn-primary text-sm font-bold py-3"
              :class="!tamanhoSelecionado || !linhaSelecionada ? 'opacity-60 cursor-not-allowed' : ''"
            >
              Adicionar à Sacola
            </button>

            <p class="mt-4 text-[10px] text-brand-cacau/40 text-center">
              Sob encomenda · mínimo {{ REGRAS.antecedenciaMinimaDias }} dias de antecedência · {{ REGRAS.entradaPercentual }}% de entrada
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import Cake3DPreview from '@/components/Cake3DPreview.vue'
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

const BATTERS_MAP = {
  baunilha: { name: 'Baunilha', color: '#F3DFC1' },
  chocolate: { name: 'Chocolate', color: '#4E3229' },
  redvelvet: { name: 'Red Velvet', color: '#8E354A' },
}

const FROSTINGS_MAP = {
  chantininho: { name: 'Chantininho Creme', color: '#F8F0E9', style: 'smooth' },
  chantininho_rose: { name: 'Chantininho Rosé', color: '#C98291', style: 'smooth' },
  berry: { name: 'Berry', color: '#8E5365', style: 'smooth' },
  ganache: { name: 'Ganache Cacau', color: '#4A2E2B', style: 'drip' },
  naked: { name: 'Naked Cake', color: '#FFFFFF', style: 'naked' },
}

const RECHEIOS_MAP = {
  brigadeiro: { name: 'Brigadeiro', color: '#3B231C' },
  ninho: { name: 'Ninho', color: '#FFF8EB' },
  morango: { name: 'Morango', color: '#C95B72' },
  doce_leite: { name: 'Doce de Leite', color: '#C68B59' },
  maracuja: { name: 'Maracujá', color: '#E8B948' },
  pistache: { name: 'Pistache', color: '#7A4426' },
}

const batterSelecionado = computed(() => BATTERS_MAP[massaSelecionada.value] || BATTERS_MAP.baunilha)

const frostingSelecionado = computed(() => FROSTINGS_MAP[coberturaSelecionada.value] || FROSTINGS_MAP.chantininho)

const recheiosSelecionadosMapeados = computed(() =>
  recheiosSelecionados.value.map((r) => RECHEIOS_MAP[r] || RECHEIOS_MAP.ninho)
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
  // Confetti de celebração nas cores da marca
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#C98291', '#8E5365', '#B88D91', '#F8F0E9'],
  })
}
</script>
