<template>
  <div class="relative min-h-[calc(100vh-80px)]">
    <!-- Decoração -->
    <div class="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-rose/10 blur-[120px] -mt-20 -mr-20" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav class="flex items-center gap-2 text-[11px] font-medium text-brand-cacau/50 mb-8">
        <span class="text-brand-cacau">Início</span>
        <span>/</span>
        <router-link to="/" class="hover:text-brand-rose">Cardápio</router-link>
        <span>/</span>
        <span class="text-brand-berry font-bold">Monte seu Bolo</span>
      </nav>

      <h2 class="font-display text-3xl text-brand-cacau font-bold mb-2">
        Monte seu Bolo Personalizado
      </h2>
      <p class="text-brand-cacau/60 text-sm mb-10 max-w-lg">
        Escolha cada detalhe do seu bolo festivo. O preço é calculado automaticamente conforme você monta.
      </p>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Bloco de opções -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Linha -->
          <section class="card-product p-5">
            <h3 class="font-display text-lg text-brand-cacau font-bold mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 4H7a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zm0 0L9 10m0 0l-4 4m4 4l4-4m4 4V6a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              1. Linha do Bolo
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="linha in LINHAS"
                :key="linha.chave"
                @click="selecionarLinha(linha.chave)"
                class="px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': linhaSelecionada === linha.chave,
                  'bg-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': linhaSelecionada !== linha.chave,
                }"
              >
                <div class="font-bold">{{ linha.label }}</div>
                <div class="text-[10px] opacity-80">{{ linha.descricao }}</div>
              </button>
            </div>
          </section>

          <!-- Tamanho -->
          <section class="card-product p-5">
            <h3 class="font-display text-lg text-brand-cacau font-bold mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h16v12H4V4zm2 12h2v2H6v-2zm0-4h2V8H6v2zm12-2h2V8h-2v2zm0-4h2V4h-2v2z" />
              </svg>
              2. Tamanho
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button
                v-for="t in TAMANHOS"
                :key="t.chave"
                @click="selecionarTamanho(t.chave)"
                class="aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': tamanhoSelecionado === t.chave,
                  'bg-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': tamanhoSelecionado !== t.chave,
                }"
              >
                <span class="font-display font-bold text-sm">{{ t.label }}</span>
                <span class="text-[10px]">{{ t.serve }}</span>
              </button>
            </div>
          </section>

          <!-- Massa -->
          <section class="card-product p-5">
            <h3 class="font-display text-lg text-brand-cacau font-bold mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              3. Massa
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="m in MASSAS"
                :key="m.chave"
                @click="selecionarMassa(m.chave)"
                class="p-3 rounded-xl border transition-all duration-200 text-sm font-medium"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': massaSelecionada === m.chave,
                  'bg-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': massaSelecionada !== m.chave,
                }"
              >
                {{ m.label }}
              </button>
            </div>
          </section>

          <!-- Recheios (até 2) -->
          <section class="card-product p-5">
            <h3 class="font-display text-lg text-brand-cacau font-bold mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.029-.543l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414L5 9.172a2 2 0 00.586-1.414L6 4z" />
              </svg>
              4. Recheios (até 2 sabores)
            </h3>
            <p class="text-xs text-brand-cacau/50 mb-3">
              Escolha até 2 sabores para as camadas entre os 3 discos de massa.
              <span class="text-brand-berry font-bold">
                {{ recheiosSelecionados.length }}/2
              </span>
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="r in RECHEIOS"
                :key="r.chave"
                @click="toggleRecheio(r.chave)"
                class="p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 min-h-[80px]"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': recheioSelecionado(r.chave),
                  'bg-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': !recheioSelecionado(r.chave),
                  'opacity-50 cursor-not-allowed': recheiosSelecionados.length >= 2 && !recheioSelecionado(r.chave),
                }"
                :disabled="recheiosSelecionados.length >= 2 && !recheioSelecionado(r.chave)"
              >
                {{ r.label }}
              </button>
            </div>
          </section>

          <!-- Cobertura -->
          <section class="card-product p-5">
            <h3 class="font-display text-lg text-brand-cacau font-bold mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h3.555a2 2 0 011.414.586l1.414 1.414A2 2 0 019.9 11.2l1.414 1.414A2 2 0 0112.455 15H19a2 2 0 012 2v2" />
              </svg>
              5. Cobertura / Acabamento
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="c in COBERTURAS"
                :key="c.chave"
                @click="selecionarCobertura(c.chave)"
                class="p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 text-sm font-medium"
                :class="{
                  'bg-brand-rose text-white border-brand-rose shadow-md': coberturaSelecionada === c.chave,
                  'bg-white text-brand-cacau/70 border-brand-mauve/30 hover:border-brand-rose': coberturaSelecionada !== c.chave,
                }"
              >
                {{ c.label }}
              </button>
            </div>
          </section>

          <!-- Adicionais e frase -->
          <section class="card-product p-5">
            <h3 class="font-display text-lg text-brand-cacau font-bold mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10H7a2 2 0 00-2 2v2a2 2 0 002 2h1m-7 8h12m-7 8h.01M12 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              6. Adicionais e Frase no Topo
            </h3>
            <div class="space-y-3">
              <div>
                <label class="label-field">Mensagem personalizada (opcional)</label>
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
                <label for="vela" class="text-sm text-brand-cacau cursor-pointer">
                  Adicionar velas (+ R$ 5,00)
                </label>
              </div>
            </div>
          </section>
        </div>

        <!-- Resumo do bolo (lateral fixa em desktop, baixo em mobile) -->
        <div class="lg:col-span-4">
          <div
            class="sticky top-6 bg-white rounded-2xl p-6 shadow-lg border border-brand-mauve/20 max-h-[calc(100vh-12px)] overflow-y-auto"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-display text-xl text-brand-cacau font-bold">Resumo do Bolo</h3>
              <span class="price text-sm">{{ formatPrice(precoTotal) }}</span>
            </div>

            <div class="space-y-4 text-sm mb-6">
              <div class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Linha</span>
                <span class="font-medium text-brand-cacau">{{ linhaSelecionadaLabel }}</span>
              </div>
              <div class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Tamanho</span>
                <span class="font-medium text-brand-cacau">
                  {{ tamanhoSelecionadoLabel }} ({{ tamanhoSelecionado.serve }})
                </span>
              </div>
              <div class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Massa</span>
                <span class="font-medium text-brand-cacau">{{ massaSelecionadaLabel }}</span>
              </div>
              <div class="flex justify-between border-b border-brand-mauve/10 pb-2">
                <span class="text-brand-cacau/60">Recheios</span>
                <span class="font-medium text-brand-cacau">
                  {{ recheiosSelecionados.length ? recheiosSelecionados.join(' + ') : '—' }}
                </span>
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
              class="mt-6 w-full btn-brand text-sm font-bold py-3"
              :class="!tamanhoSelecionado || !linhaSelecionada ? 'opacity-60 cursor-not-allowed' : ''"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar à Sacola
            </button>

            <p class="mt-4 text-[10px] text-brand-cacau/40 text-center">
              Sob encomenda · mínimo {{ REGRAS.antecedenciaMinimaDias }} dias de antecedência · 50% de entrada
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  TAMANHOS, LINHAS, MASSAS, RECHEIOS, COBERTURAS, REGRAS,
} from '@/data/catalogo'
import { useCart } from '@/composables/useCart'

const router = useRouter()
const { adicionar: adicionarCarrinho } = useCart()

const linhaSelecionada = ref('tradicional')
const tamanhoSelecionado = ref(TAMANHOS[0])
const massaSelecionada = ref('baunilha')
const recheiosSelecionados = ref([])
const coberturaSelecionada = ref('chantininho')
const fraseTopo = ref('')
const comVelas = ref(false)

function selecionarLinha(chave) {
  linhaSelecionada.value = chave
}
function selecionarTamanho(chave) {
  tamanhoSelecionado.value = TAMANHOS.find((t) => t.chave === chave)
}
function selecionarMassa(chave) {
  massaSelecionada.value = chave
}
function toggleRecheio(chave) {
  const idx = recheiosSelecionados.value.indexOf(chave)
  if (idx !== -1) recheiosSelecionados.value.splice(idx, 1)
  else if (recheiosSelecionados.value.length < 2) recheiosSelecionados.value.push(chave)
}
function selecionarCobertura(chave) {
  coberturaSelecionada.value = chave
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
  return produto * tamanhoSelecionado.precoMultiplicador
})

const precoCobertura = computed(() => {
  const c = COBERTURAS.find((x) => x.chave === coberturaSelecionada.value)
  return c?.precoAdicional || 0
})

const precoTotal = computed(() =>
  Math.round((precoBase.value + precoCobertura.value + (comVelas.value ? 5 : 0)) * 100) / 100
)

function adicionarSacolaBolo() {
  if (!tamanhoSelecionado || !linhaSelecionada) return
  const item = {
    id: `bolo-${linhaSelecionada.value}-${tamanhoSelecionado.chave}`,
    nome: `Bolo Festivo ${linhaSelecionadaLabel.value} (${tamanhoSelecionado.label})`,
    tipo: 'encomenda',
    linha: linhaSelecionada.value,
    precoUnitario: precoTotal.value,
    quantidade: 1,
    imagem: linhaSelecionada.value === 'premium'
      ? 'https://images.unsplash.com/photo-1573825539949-5c63b487f3e5?w=400&q=80'
      : 'https://images.unsplash.com/photo-1563927757781-93672a6707d4?w=400&q=80',
    opcoes: {
      linha: linhaSelecionada.value,
      tamanho: tamanhoSelecionado.label,
      massa: massaSelecionada.value,
      recheios: recheiosSelecionados.value,
      cobertura: coberturaSelecionada.value,
      fraseTopo: fraseTopo.value,
      comVelas: comVelas.value,
    },
  }
  adicionarCarrinho(item)
  router.push({ name: 'Checkout' })
}

const formatPrice = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
</script>
