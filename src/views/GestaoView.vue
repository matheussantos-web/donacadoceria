<template>
  <div class="min-h-screen bg-gradient-to-br from-[#FDF8F5] via-[#FFF9F6] to-[#FCEEE9]">
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-200/40 blur-[120px] rounded-full -mt-24 pointer-events-none z-0"></div>

    <header class="relative z-10">
      <div class="max-w-screen-xl mx-auto px-4 py-6">
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center gap-3 mb-2">
            <img :src="logoImg" class="h-10 w-auto" alt="Logo" />
            <div>
              <h1 class="font-display font-bold text-2xl text-brand-text-primary tracking-tight">
                Gestão — Dona Ca Doceria
              </h1>
              <p class="text-xs text-brand-text-muted">
                Atelier de Confeitaria Contemporânea · {{ greeting }}
              </p>
            </div>
          </div>
          <router-link
            to="/"
            class="text-sm font-medium text-brand-text-muted hover:text-brand-primary transition-colors px-4 py-2.5"
          >
            Ver catálogo público
          </router-link>
          <button
            @click="logout"
            class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-text-muted hover:text-brand-primary transition-colors"
          >
            <span class="text-xs">Sair</span>
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="flex items-center justify-between gap-4">
          <div class="flex-1 bg-white/80 backdrop-blur-sm border border-rose-100/60 rounded-2xl p-4 shadow-sm">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                  Encomendas próximas
                </p>
                <p class="font-display font-bold text-xl text-brand-text-primary tabular-nums">
                  {{ upcomingOrders.length }}
                </p>
                <p class="text-xs text-brand-text-muted mt-0.5">
                  R$ {{ totalToReceive }} a receber
                </p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Package class="w-5 h-5 text-brand-primary" />
              </div>
            </div>
          </div>
          <button
            @click="showScanner = true"
            class="bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-800 hover:to-pink-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-rose-900/20 hover:shadow-rose-900/30 transition-all duration-300 flex items-center gap-2"
          >
            <QrCode class="w-4 h-4" />
            <span>Importar NFC-e</span>
          </button>
        </div>
      </div>
    </header>

    <div class="relative z-10 max-w-screen-xl mx-auto px-4 pb-12">
      <div class="mb-8">
        <div class="w-full overflow-x-auto pb-2 scrollbar-hide shrink-0">
          <div class="flex items-center gap-2 py-1 shrink-0 min-w-full sm:min-w-0">
            <button
              v-for="module in modules"
              :key="module.key"
              @click="activeModule = module.key"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full border shrink-0 transition-all duration-300 whitespace-nowrap min-w-[120px] sm:min-w-auto"
              :class="
                activeModule === module.key
                  ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-rose-900/20'
                  : 'border-transparent text-brand-text-muted hover:bg-gray-100 hover:text-brand-text-primary'
              "
            >
              <component :is="moduleIcons[module.key]" class="w-4 h-4" />
              <span>{{ module.label }}</span>
              <span
                v-if="module.badge"
                class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                :class="
                  module.badgeColor === 'alert'
                    ? 'bg-rose-100 text-rose-700'
                    : module.badgeColor === 'warn'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                "
              >
                {{ module.badge }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <div v-if="activeModule === 'dashboard'" class="space-y-8" key="dashboard">
          <h2 class="font-display font-bold text-2xl text-brand-text-primary mb-2">
            Visão Geral
          </h2>
          <p class="text-brand-text-muted text-sm mb-6">
            Acompanhe o desempenho do seu atelier em um piscar de olhos.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 fadeInUp">
            <div class="bg-white/90 backdrop-blur-sm border border-rose-100/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 hover:-translate-y-0.5 transition-all duration-300 group">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Package class="w-5 h-5 text-brand-primary" />
                </div>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="
                    lowStockCount > 0
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-green-100 text-green-700'
                  "
                >
                  {{ lowStockCount > 0 ? 'Atenção' : 'OK' }}
                </span>
              </div>
              <p class="text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                Total de Insumos
              </p>
              <p class="font-display font-bold text-2xl text-brand-text-primary tabular-nums">
                {{ ingredients.length }}
              </p>
            </div>
            <div class="bg-white/90 backdrop-blur-sm border border-rose-100/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 hover:-translate-y-0.5 transition-all duration-300 group fadeInFast">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle class="w-5 h-5 text-amber-600" />
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                  Baixo
                </span>
              </div>
              <p class="text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                Alertas de Estoque
              </p>
              <p class="font-display font-bold text-2xl text-red-600 tabular-nums">
                {{ lowStockCount }}
              </p>
            </div>
            <div class="bg-white/90 backdrop-blur-sm border border-rose-100/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 hover:-translate-y-0.5 transition-all duration-300 group">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen class="w-5 h-5 text-brand-secondary" />
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                  Ativas
                </span>
              </div>
              <p class="text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                Receitas Cadastradas
              </p>
              <p class="font-display font-bold text-2xl text-brand-text-primary tabular-nums">
                {{ recipes.length }}
              </p>
            </div>
            <div class="bg-white/90 backdrop-blur-sm border border-rose-100/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 hover:-translate-y-0.5 transition-all duration-300 group">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Tag class="w-5 h-5 text-purple-600" />
                </div>
                <span
                  v-if="productsNeedingPriceReview.length > 0"
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 pulse-soft"
                >
                  Revisar
                </span>
              </div>
              <p class="text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                Produtos Precificados
              </p>
              <p class="font-display font-bold text-2xl text-brand-text-primary tabular-nums">
                {{ pricedProducts.length }}
              </p>
            </div>
            <div class="bg-white/90 backdrop-blur-sm border border-rose-100/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 hover:-translate-y-0.5 transition-all duration-300 group">
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wallet class="w-5 h-5 text-emerald-600" />
                </div>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="
                    monthBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  "
                >
                  {{ monthBalance >= 0 ? 'Positivo' : 'Negativo' }}
                </span>
              </div>
              <p class="text-xs font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                Saldo Financeiro (mês)
              </p>
              <p class="font-display font-bold text-2xl"
                 :class="monthBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'"
              >
                {{ formatPrice(monthBalance) }}
              </p>
              <p class="text-xs text-brand-text-muted mt-1">
                {{ formatPrice(monthEntries) }} entra · {{ formatPrice(monthExits) }} sai
              </p>
            </div>
          </div>

          <div
            v-if="productsNeedingPriceReview.length > 0"
            class="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm fadeInUp"
          >
            <div class="flex items-start gap-3">
              <AlertTriangle class="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p class="font-medium text-amber-800 mb-1">
                  {{ productsNeedingPriceReview.length }} produto(s) precisam de revisão de preço
                </p>
                <p class="text-xs text-amber-700 mb-3">
                  A margem real está abaixo do alvo configurado. Clique para ajustar.
                </p>
                <button
                  @click="activeModule = 'precificacao'"
                  class="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg transition-colors"
                >
                  Ir para Precificação
                  <ChevronRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white/90 backdrop-blur-sm border border-rose-100/80 rounded-2xl p-6 shadow-sm fadeInUp">
            <h3 class="font-display font-bold text-lg text-brand-text-primary mb-5 flex items-center gap-2">
              <GitBranch class="w-5 h-5 text-brand-primary" />
              Fluxo do Atelier
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div
                v-for="step in atelierFlow"
                :key="step.key"
                class="flex flex-col items-center gap-2 relative group"
              >
                <div class="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-brand-primary flex items-center justify-center shadow-sm group-hover:border-brand-primary-hover transition-colors">
                  <span class="text-brand-primary font-bold text-sm">{{ step.number }}</span>
                </div>
                <div
                  class="w-full h-1 bg-rose-100 absolute top-[46px] z-0"
                  v-if="step.key !== 'venda'"
                ></div>
                <div class="w-full max-w-[120px] text-center">
                  <p class="font-medium text-sm text-brand-text-primary">
                    {{ step.label }}
                  </p>
                  <p class="text-[10px] text-brand-text-muted font-medium mt-0.5">
                    {{ step.count }} itens
                  </p>
                </div>
                <button
                  @click="activeModule = step.key"
                  class="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-brand-primary text-white text-[10px] font-bold rounded-full shadow-md whitespace-nowrap"
                >
                  Acessar
                </button>
              </div>
            </div>
          </div>
        </div>

        <IngredientsManager v-if="activeModule === 'estoque'" key="estoque" />
        <OrdersManager v-if="activeModule === 'pedidos'" key="pedidos" />
        <FinanceManager v-if="activeModule === 'financeiro'" key="financeiro" />
        <RecipesManager v-if="activeModule === 'receitas'" key="receitas" />
        <PricingManager v-if="activeModule === 'precificacao'" key="precificacao" />

        <div v-if="activeModule === 'nfce'" class="space-y-6">
          <h2 class="font-display font-bold text-2xl text-brand-text-primary">
            Importar Nota Fiscal
          </h2>
          <p class="text-brand-text-muted">
            Leia a chave de acesso da NFC-e para atualizar estoque e custos automaticamente.
          </p>
          <NfceScannerModal
            v-if="showScanner"
            :visible="showScanner"
            @nfce-scanned="handleNfceScanned"
            @manual-entry="handleManualEntry"
            @close="showScanner = false"
          />
          <button
            @click="showScanner = true"
            class="btn-primary px-6 py-3 text-sm font-medium flex items-center gap-2 shadow-lg shadow-rose-900/10 hover:shadow-rose-900/20"
          >
            <QrCode class="w-4 h-4" />
            Escanear Nota Fiscal
          </button>
        </div>

        <NfceReconciliationModal
          v-if="showReconciliation && pendingNfce"
          :visible="showReconciliation"
          :nfce="pendingNfce"
          @confirmed="onReconciliationConfirmed"
          @close="showReconciliation = false"
        />
      </div>

      <ToastContainer :toasts="toasts" @dismiss="dismissToast" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { useRoute, RouterLink } from "vue-router"
import { useToast } from "@/composables/useToast"
import logoImg from "@/assets/logo-donaca.jpg"
import IngredientsManager from "@/components/gestao/IngredientsManager.vue"
import RecipesManager from "@/components/gestao/RecipesManager.vue"
import PricingManager from "@/components/gestao/PricingManager.vue"
import NfceScannerModal from "@/components/gestao/NfceScannerModal.vue"
import NfceReconciliationModal from "@/components/gestao/NfceReconciliationModal.vue"
import OrdersManager from "@/components/gestao/OrdersManager.vue"
import FinanceManager from "@/components/gestao/FinanceManager.vue"
import ToastContainer from "@/components/gestao/ToastContainer.vue"
import { parseNfceCopiedText } from "@/utils/parseNfceText"
import { ingredientsService } from "@/services/ingredients"
import { recipesService } from "@/services/recipes"
import { pricedProductsService } from "@/services/recipes"
import { ordersService } from "@/services/orders"
import { financeService } from "@/services/finance"
import { useAuth } from "@/composables/useAuth"
import {
  X,
  Package,
  QrCode,
  LayoutDashboard,
  ClipboardList,
  Wallet,
  AlertTriangle,
  BookOpen,
  Tag,
  ReceiptText,
  ChevronRight,
  GitBranch,
} from "lucide-vue-next"

const { signOut } = useAuth()
const { toast, toasts, success, error, warning, info, dismiss: dismissToast } = useToast()

const activeModule = ref("dashboard")
const showScanner = ref(false)
const showReconciliation = ref(false)
const pendingNfce = ref(null)
const route = useRoute()

const ingredients = ref([])
const recipes = ref([])
const pricedProducts = ref([])
const orders = ref([])
const financialTransactions = ref([])

const lowStockCount = computed(() =>
  ingredients.value.filter((i) => i.stockQuantity <= i.minStockAlert).length
)

const upcomingOrders = computed(() =>
  orders.value
    .filter((o) => o.status !== "entregue" && o.status !== "cancelado")
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
    .slice(0, 5)
)

const totalToReceive = computed(() =>
  (orders.value || [])
    .filter((o) => o.status !== "entregue" && o.status !== "cancelado")
    .reduce((sum, o) => sum + Math.max(0, o.totalAmount - o.depositPaid), 0)
)

const now = new Date()
const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

const monthTransactions = computed(() =>
  (financialTransactions.value || []).filter(
    (t) => t.transactionDate >= currentMonthStart && t.transactionDate <= currentMonthEnd
  )
)

const monthEntries = computed(() =>
  (monthTransactions.value || [])
    .filter((t) => t.type === "entrada")
    .reduce((sum, t) => sum + t.amount, 0)
)

const monthExits = computed(() =>
  (monthTransactions.value || [])
    .filter((t) => t.type === "saida")
    .reduce((sum, t) => sum + t.amount, 0)
)

const monthBalance = computed(() => monthEntries.value - monthExits.value)

const formatPrice = (price) => {
  if (price == null || Number.isNaN(Number(price))) return "R$ 0,00"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(price))
}

const formatNumber = (num) => {
  if (num == null || Number.isNaN(Number(num))) return "0"
  return Number(num).toLocaleString("pt-BR")
}

const productsNeedingPriceReview = computed(() =>
  pricedProducts.value.filter((p) => {
    const suggested = Number(p.suggestedPrice) || 0
    const finalPrice = Number(p.finalPrice) || 0
    const targetMargin = Number(p.targetMarginPercent) || 0
    const cost = Number(p.totalProductionCost) || 0
    if (!suggested || !finalPrice || !targetMargin) return false
    const realMargin = ((finalPrice - cost) / finalPrice) * 100
    const marginGap = targetMargin - realMargin
    return finalPrice < suggested || marginGap > 3
  })
)

const moduleIcons = {
  dashboard: LayoutDashboard,
  pedidos: ClipboardList,
  financeiro: Wallet,
  estoque: Package,
  receitas: BookOpen,
  precificacao: Tag,
  nfce: ReceiptText,
}

const modules = [
  { key: "dashboard", label: "Visão Geral", badge: null, badgeColor: null },
  { key: "pedidos", label: "Pedidos", badge: upcomingOrders.value.length > 0 ? upcomingOrders.value.length : null, badgeColor: "alert" },
  { key: "financeiro", label: "Financeiro", badge: null, badgeColor: null },
  { key: "estoque", label: "Estoque", badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: "alert" },
  { key: "receitas", label: "Receitas", badge: recipes.value.length, badgeColor: null },
  { key: "precificacao", label: "Precificação", badge: productsNeedingPriceReview.value.length > 0 ? productsNeedingPriceReview.value.length : null, badgeColor: "warn" },
  { key: "nfce", label: "NFC-e", badge: null, badgeColor: null },
]

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
})

const atelierFlow = [
  { key: "nfce", number: "1", label: "Importar NFC-e", count: 0 },
  { key: "estoque", number: "2", label: "Conferir Estoque", count: ingredients.value.length },
  { key: "receitas", number: "3", label: "Calcular Receita", count: recipes.value.length },
  { key: "precificacao", number: "4", label: "Precificar Produto", count: pricedProducts.value.length },
  { key: "pedidos", number: "5", label: "Registrar Encomenda", count: upcomingOrders.value.length },
]

onMounted(() => {
  loadData()
  handleSharedContent()
})

watch(activeModule, (newModule) => {
  if (newModule === 'nfce') {
    showScanner.value = true
  }
})

async function handleSharedContent() {
  const sharedText = route.query.text || route.query.url
  if (!sharedText) return

  if (route.query.text || route.query.url) {
    window.history.replaceState({}, document.title, route.path)
  }

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
  } else {
    error(result.error || "Não foi possível processar o conteúdo compartilhado.")
  }
}

async function loadData() {
  try {
    const [ings, recs, prods, ords, fin] = await Promise.all([
      ingredientsService.list(),
      recipesService.list(),
      pricedProductsService.list(),
      ordersService.list(),
      financeService.list(),
    ])
    ingredients.value = ings
    recipes.value = recs
    pricedProducts.value = prods
    orders.value = ords
    financialTransactions.value = fin
    success("Dados carregados com sucesso!", { duration: 3000 })
  } catch (err) {
    console.error("[GestaoView] Erro ao carregar dados.", err.message)
    error("Erro ao carregar os dados do atelier.")
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
  success("Nota fiscal conciliada com sucesso! Estoque atualizado.", { duration: 4000 })
}

const logout = async () => {
  await signOut()
  window.location.href = "/login"
}
</script>

<style>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>