<template>
  <div class="min-h-screen bg-brand-bg">
    <!-- Header -->
    <header class="bg-brand-surface border-b border-gray-100 px-4 py-4 sticky top-0 z-40">
      <div class="max-w-screen-xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img :src="logoImg" class="h-8 w-auto mr-3" />
          <span class="font-display font-medium text-lg text-brand-text-primary">
            Gestão — Dona Cá Doceria
          </span>
        </div>
        <div class="flex items-center gap-3">
          <button @click="logout" class="text-sm text-brand-text-muted hover:text-brand-primary transition-colors">Sair</button>
        </div>
      </div>
    </header>

    <div class="max-w-screen-xl mx-auto px-4 py-8">
      <!-- Navegação de módulos -->
      <div class="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          v-for="module in modules"
          :key="module.key"
          @click="activeModule = module.key"
          :class="moduleClass(module)"
        >
          {{ module.label }}
        </button>
      </div>

      <!-- Módulo: Dashboard -->
      <div v-if="activeModule === 'dashboard'" class="space-y-6">
        <h2 class="font-display font-medium text-2xl text-brand-text-primary">Visão Geral</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
            <p class="text-xs text-brand-text-muted uppercase tracking-wider">Total de Insumos</p>
            <p class="font-display font-medium text-2xl text-brand-text-primary">{{ ingredients.length }}</p>
          </div>
          <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
            <p class="text-xs text-brand-text-muted uppercase tracking-wider">Alertas de Estoque</p>
            <p class="font-display font-medium text-2xl text-red-600">{{ lowStockCount }}</p>
          </div>
          <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
            <p class="text-xs text-brand-text-muted uppercase tracking-wider">Receitas Cadastradas</p>
            <p class="font-display font-medium text-2xl text-brand-text-primary">{{ recipes.length }}</p>
          </div>
          <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
            <p class="text-xs text-brand-text-muted uppercase tracking-wider">Produtos Precificados</p>
            <p class="font-display font-medium text-2xl text-brand-text-primary">{{ pricedProducts.length }}</p>
          </div>
          <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
            <p class="text-xs text-brand-text-muted uppercase tracking-wider">Próximas Encomendas</p>
            <p class="font-display font-medium text-2xl text-brand-text-primary">{{ upcomingOrders.length }}</p>
            <p class="text-xs text-brand-text-muted mt-1">R$ {{ totalToReceive }} a receber</p>
          </div>
        </div>
      </div>

      <!-- Módulo: Estoque & Insumos -->
      <IngredientsManager v-if="activeModule === 'estoque'" />

      <!-- Módulo: Pedidos & Encomendas -->
      <OrdersManager v-if="activeModule === 'pedidos'" />

      <!-- Módulo: Receitas -->
      <RecipesManager v-if="activeModule === 'receitas'" />

      <!-- Módulo: Precificação -->
      <PricingManager v-if="activeModule === 'precificacao'" />

      <!-- Módulo: Scanner NFC-e -->
      <div v-if="activeModule === 'nfce'" class="space-y-6">
        <h2 class="font-display font-medium text-2xl text-brand-text-primary">Importar Nota Fiscal</h2>
        <p class="text-brand-text-muted">Leia a chave de acesso da NFC-e para atualizar estoque e custos automaticamente.</p>
        <NfceScannerModal
          v-if="showScanner"
          :visible="showScanner"
          @nfce-scanned="handleNfceScanned"
          @manual-entry="handleManualEntry"
          @close="showScanner = false"
        />
        <button
          @click="showScanner = true"
          class="btn-primary px-4 py-2 text-sm font-medium flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          Escanear Nota Fiscal (QR Code)
        </button>
      </div>

      <!-- Modal de Conciliação de NFC-e -->
      <NfceReconciliationModal
        v-if="showReconciliation && pendingNfce"
        :visible="showReconciliation"
        :nfce="pendingNfce"
        @confirmed="onReconciliationConfirmed"
        @close="showReconciliation = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute } from "vue-router"
import logoImg from "@/assets/logo-donaca.jpg"
import IngredientsManager from "@/components/gestao/IngredientsManager.vue"
import RecipesManager from "@/components/gestao/RecipesManager.vue"
import PricingManager from "@/components/gestao/PricingManager.vue"
import NfceScannerModal from "@/components/gestao/NfceScannerModal.vue"
import NfceReconciliationModal from "@/components/gestao/NfceReconciliationModal.vue"
import OrdersManager from "@/components/gestao/OrdersManager.vue"
import { parseNfceCopiedText } from "@/utils/parseNfceText"
import { ingredientsService } from "@/services/ingredients"
import { recipesService } from "@/services/recipes"
import { pricedProductsService } from "@/services/recipes"
import { ordersService } from "@/services/orders"
import { useAuth } from "@/composables/useAuth"

const { signOut } = useAuth()

const modules = [
  { key: "dashboard", label: "Visão Geral" },
  { key: "pedidos", label: "Pedidos & Encomendas" },
  { key: "estoque", label: "Estoque & Insumos" },
  { key: "receitas", label: "Receitas" },
  { key: "precificacao", label: "Precificação" },
  { key: "nfce", label: "Importar Nota Fiscal" },
]

const activeModule = ref("dashboard")
const showScanner = ref(false)
const showReconciliation = ref(false)
const pendingNfce = ref(null)
const route = useRoute()

const ingredients = ref([])
const recipes = ref([])
const pricedProducts = ref([])
const orders = ref([])

const lowStockCount = computed(() =>
  ingredients.value.filter((i) => i.stockQuantity <= i.minStockAlert).length
)

const upcomingOrders = computed(() =>
  orders.value
    .filter((o) => o.status !== 'entregue' && o.status !== 'cancelado')
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
    .slice(0, 5)
)

const totalToReceive = computed(() =>
  orders.value
    .filter((o) => o.status !== 'entregue' && o.status !== 'cancelado')
    .reduce((sum, o) => sum + Math.max(0, o.totalAmount - o.depositPaid), 0)
)

const logoImgRef = logoImg

function moduleClass(module) {
  return [
    "px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200",
    activeModule.value === module.key
      ? "bg-brand-primary text-white shadow-sm"
      : "bg-brand-surface text-brand-text-muted border border-gray-200 hover:bg-gray-50",
  ]
}

onMounted(() => {
  loadData()
  handleSharedContent()
})

async function handleSharedContent() {
  const sharedText = route.query.text || route.query.url
  if (!sharedText) return

  // Limpa os query params da URL
  if (route.query.text || route.query.url) {
    window.history.replaceState({}, document.title, route.path)
  }

  // Se é uma URL ou chave de acesso, chama a API
  const isUrl = String(sharedText).startsWith("http")
  const isAccessKey = /^\d{44}$/.test(String(sharedText).replace(/\s/g, ""))

  if (isUrl || isAccessKey) {
    try {
      const response = await fetch("/api/parse-nfce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sharedText }),
      })

      if (!response.ok) {
        const errData = await response.json()
        console.error("[Share] Erro da API:", errData.error)
        return
      }

      const data = await response.json()
      if (data.success && data.items && data.items.length > 0) {
        pendingNfce.value = data
        showScanner.value = false
        showReconciliation.value = true
      }
    } catch (err) {
      console.error("[Share] Erro ao processar conteúdo compartilhado:", err.message)
    }
    return
  }

  // Senão, trata como texto copiado da SEFAZ-RJ
  const result = parseNfceCopiedText(sharedText)
  if (result.success && result.items && result.items.length > 0) {
    pendingNfce.value = {
      accessKey: result.accessKey,
      storeName: result.storeName,
      issueDate: result.issueDate,
      totalAmount: result.totalAmount,
      items: result.items.map((item) => ({
        ...item,
        suggestedPackage: item.suggestedPackage || { packageSize: 1, baseUnit: "un", purchaseUnit: "un" },
      })),
      rawUrl: "texto-compartilhado",
    }
    showScanner.value = false
    showReconciliation.value = true
  }
}

async function loadData() {
  try {
    const [ings, recs, prods, ords] = await Promise.all([
      ingredientsService.list(),
      recipesService.list(),
      pricedProductsService.list(),
      ordersService.list(),
    ])
    ingredients.value = ings
    recipes.value = recs
    pricedProducts.value = prods
    orders.value = ords
  } catch (err) {
    console.error("[GestaoView] Erro ao carregar dados.", err.message)
  }
}

async function handleNfceScanned(nfce) {
  pendingNfce.value = nfce
  showScanner.value = false
  showReconciliation.value = true
}

function handleManualEntry() {
  showScanner.value = false
  activeModule.value = "estoque"
}

async function onReconciliationConfirmed(invoice) {
  showReconciliation.value = false
  pendingNfce.value = null
  await loadData()
}

const logout = async () => {
  await signOut()
  window.location.href = "/login"
}
</script>