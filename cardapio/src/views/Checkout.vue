<template>
  <div class="min-h-screen bg-brand-creme pt-20 pb-12">
    <AppHeader />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10">
        <h2 class="font-display text-3xl text-brand-cacau font-bold mb-2">
          Finalizar Pedido
        </h2>
        <p class="text-brand-cacau/60 text-sm">
          Revise seu pedido e envie pelo WhatsApp.
        </p>
      </div>

      <!-- Resumo da sacola -->
      <div v-if="itens.length > 0" class="bg-white rounded-2xl p-6 sm:p-8 border border-brand-mauve/20 shadow-sm mb-8">
        <h3 class="font-display text-lg text-brand-cacau font-bold mb-5">
          Itens do Pedido
        </h3>

        <div class="space-y-4">
          <div
            v-for="item in itens"
            :key="item.id + JSON.stringify(item.opcoes)"
            class="flex gap-4 bg-brand-creme rounded-xl p-3 border border-brand-mauve/10"
          >
            <img
              :src="item.imagem"
              :alt="item.nome"
              class="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-brand-cacau text-sm leading-tight">
                {{ item.nome }}
              </h4>
              <p class="text-[10px] text-brand-cacau/50 mt-0.5">
                {{ item.tipo === 'encomenda' ? 'Sob encomenda' : 'Pronta entrega' }}
                {{ item.linha ? ' · ' + item.linha.charAt(0).toUpperCase() + item.linha.slice(1) : '' }}
              </p>
              <div v-if="item.opcoes" class="mt-1 space-y-1 text-[10px] text-brand-cacau/70">
                <div v-if="item.opcoes.tamanho" class="flex justify-between">
                  <span>Tamanho:</span>
                  <span class="font-medium">{{ item.opcoes.tamanho }}</span>
                </div>
                <div v-if="item.opcoes.massa" class="flex justify-between">
                  <span>Massa:</span>
                  <span class="font-medium">{{ item.opcoes.massa }}</span>
                </div>
                <div v-if="item.opcoes.recheios?.length" class="flex justify-between">
                  <span>Recheios:</span>
                  <span class="font-medium">{{ item.opcoes.recheios.join(', ') }}</span>
                </div>
                <div v-if="item.opcoes.cobertura" class="flex justify-between">
                  <span>Cobertura:</span>
                  <span class="font-medium">{{ item.opcoes.cobertura }}</span>
                </div>
                <div v-if="item.opcoes.fraseTopo" class="flex justify-between">
                  <span>Frase:</span>
                  <span class="font-medium italic">"{{ item.opcoes.fraseTopo }}"</span>
                </div>
                <div v-if="item.opcoes.comVelas" class="flex justify-between">
                  <span>Velas:</span>
                  <span class="font-medium">Sim</span>
                </div>
              </div>
              <div class="mt-2 flex items-center justify-between">
                <span class="price text-sm">{{ formatPrice(item.precoUnitario) }}</span>
                <span class="text-xs text-brand-cacau/50">× {{ item.quantidade }}</span>
              </div>
            </div>
          </div>

          <div class="border-t border-brand-mauve/20 pt-5 mt-5">
            <div class="flex justify-between text-lg font-bold mb-2">
              <span class="text-brand-cacau">Total Estimado</span>
              <span class="price tabular-nums">{{ formatPrice(subtotal) }}</span>
            </div>
            <p class="text-[10px] text-brand-cacau/50">
              Valores de produtos sob encomenda são baseados no tamanho e opções selecionadas. O preço final será confirmado no WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <!-- Formulário de checkout -->
      <div class="bg-white rounded-2xl p-6 sm:p-8 border border-brand-mauve/20 shadow-sm">
        <h3 class="font-display text-lg text-brand-cacau font-bold mb-5 flex items-center gap-2">
          <svg class="w-5 h-5 text-brand-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h3.555a2 2 0 011.414.586l1.414 1.414A2 2 0 019.9 11.2l1.414 1.414A2 2 0 0112.455 15H19a2 2 0 012 2v2" />
          </svg>
          Dados para contato
        </h3>

        <form @submit.prevent="enviarWhatsApp" class="space-y-5">
          <div>
            <label class="label-field">Nome completo</label>
            <input
              v-model="cliente.nome"
              type="text"
              placeholder="Seu nome"
              class="input-field"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label-field">Modalidade</label>
              <select v-model="cliente.modalidade" class="input-field">
                <option value="entrega">Entrega</option>
                <option value="retirada">Retirada</option>
              </select>
            </div>
            <div>
              <label class="label-field">Forma de pagamento</label>
              <select v-model="cliente.pagamento" class="input-field">
                <option value="pix">Pix</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
              </select>
            </div>
          </div>

          <div>
            <label class="label-field">Data e horário desejado</label>
            <input
              v-model="cliente.dataHora"
              type="datetime-local"
              class="input-field"
              :min="dataMinima"
              required
            />
            <p class="text-[10px] text-brand-cacau/50 mt-1">
              Encomendas com mínimo de {{ REGRAS.antecedenciaMinimaDias }} dias de antecedência.
            </p>
          </div>

          <div v-if="cliente.modalidade === 'entrega'" class="mt-4">
            <label class="label-field">Endereço de entrega</label>
            <input
              v-model="cliente.endereco"
              type="text"
              placeholder="Rua, número, bairro, CEP"
              class="input-field"
            />
            <p class="text-[10px] text-brand-cacau/50 mt-1">
              Entrega a combinar no WhatsApp.
            </p>
          </div>

          <div v-if="cliente.modalidade === 'retirada'" class="mt-4">
            <p class="text-[10px] text-brand-cacau/50">
              Retirada a combinar no WhatsApp.
            </p>
          </div>

          <div>
            <label class="label-field">Observações (opcional)</label>
            <textarea
              v-model="cliente.observacoes"
              rows="3"
              placeholder="Alguma observação especial?"
              class="input-field"
            />
          </div>

          <div class="pt-4 border-t border-brand-mauve/20">
            <button
              type="submit"
              class="w-full btn-brand text-sm font-bold py-4"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Enviar Pedido pelo WhatsApp
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-xs text-brand-cacau/50 uppercase tracking-wider mb-2">
            ou fale direto
          </p>
          <a
            :href="`https://wa.me/${LOJA.whatsapp}`"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 btn-outline text-xs py-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
            Conversar no WhatsApp
          </a>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { LOJA, REGRAS } from '@/data/catalogo'
import { useCart } from '@/composables/useCart'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const { itens, subtotal } = useCart()

const cliente = ref({
  nome: '',
  modalidade: 'entrega',
  pagamento: 'pix',
  dataHora: '',
  endereco: '',
  observacoes: '',
})

// Data mínima: hoje + 5 dias
const hoje = new Date()
const dataMinima = computed(() => {
  const d = new Date(hoje)
  d.setDate(d.getDate() + REGRAS.antecedenciaMinimaDias)
  return d.toISOString().slice(0, 16)
})

// Se modalidade é retirada, não exige endereço (validação simples)
watch(cliente.modalidade, (val) => {
  if (val === 'retirada') cliente.value.endereco = ''
})

const formatPrice = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

function enviarWhatsApp() {
  if (!cliente.value.nome.trim()) {
    alert('Por favor, informe seu nome.')
    return
  }
  if (!cliente.value.dataHora) {
    alert('Por favor, escolha data e horário.')
    return
  }

  const linhas = []
  linhas.push(`*${LOJA.nome} - Novo Pedido*`)
  linhas.push('')
  linhas.push('*Cliente:* ' + cliente.value.nome)
  linhas.push('*Modalidade:* ' + (cliente.value.modalidade === 'entrega' ? 'Entrega' : 'Retirada'))
  linhas.push('*Pagamento:* ' + cliente.value.pagamento)
  linhas.push('*Data/Horário:* ' + cliente.value.dataHora)
  if (cliente.value.endereco) linhas.push('*Endereço:* ' + cliente.value.endereco)
  if (cliente.value.observacoes) linhas.push('*Observações:* ' + cliente.value.observacoes)
  linhas.push('')
  linhas.push('*Itens:*')
  let total = 0
  for (const item of itens) {
    linhas.push(`- ${item.nome} (${item.tipo === 'encomenda' ? 'sob encomenda' : 'pronta entrega'}) ×${item.quantidade} - ${formatPrice(item.precoUnitario)}`)
    total += item.precoUnitario * item.quantidade
  }
  linhas.push('')
  linhas.push(`*Total estimado:* ${formatPrice(total)}`)
  linhas.push('')
  linhas.push('Encomendas com mínimo de 5 dias de antecedência. 50% de entrada. Pagamento: Pix, Dinheiro ou Cartão.')
  linhas.push('')
  linhas.push('Aguardo confirmação!')

  const texto = linhas.join('%0A')
  window.open(`https://wa.me/${LOJA.whatsapp}?text=${texto}`, '_blank')
}
</script>
