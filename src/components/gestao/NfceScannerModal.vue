<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80" @click.self="closeModal">
    <div class="bg-brand-surface rounded-2xl w-full max-w-md p-6 relative" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display font-medium text-lg text-brand-text-primary">
          Importar Nota Fiscal (NFC-e)
        </h3>
        <button
          @click="closeModal"
          class="absolute top-2 right-2 p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
          aria-label="Fechar"
        >
          <span class="text-2xl">✕</span>
        </button>
      </div>

      <!-- 3 opções de importação -->
      <div class="space-y-3 mb-6">
        <button
          @click="startCameraMode"
          :disabled="cameraModeActive"
          class="w-full btn-primary py-3 text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          {{ cameraModeActive ? "Câmera ativa..." : "1. Escanear QR Code (Câmera)" }}
        </button>

        <button
          @click="showPasteMode = true"
          class="w-full py-3 text-sm font-medium text-brand-primary underline hover:text-brand-accent bg-brand-bg/50 rounded-lg border border-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
          </svg>
          2. Colar Texto ou Link da Nota
        </button>

        <button
          @click="openManualEntry"
          class="w-full py-3 text-sm font-medium text-brand-text-muted hover:bg-gray-50 rounded-lg border border-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          3. Lançar Compra Manualmente
        </button>
      </div>

      <!-- Câmera / QR Code (v-show para manter o elemento no DOM) -->
      <div v-show="cameraModeActive" class="mt-6">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs text-brand-text-muted">Leitura de QR Code</span>
          <button
            @click="stopCameraMode"
            class="text-xs text-brand-text-muted underline hover:text-brand-primary"
          >
            Desligar câmera
          </button>
        </div>
        <div class="bg-brand-bg border border-gray-200 rounded-lg p-4 relative overflow-hidden min-h-[320px] sm:min-h-[360px] w-full mb-3">
          <div id="qr-reader" class="w-full h-full"></div>
          <div
            v-if="!isScannerReady"
            class="absolute inset-0 flex flex-col items-center justify-center text-brand-text-muted"
          >
            <p class="text-sm">Inicializando câmera...</p>
            <p class="text-xs mt-2">Permita o acesso à câmera no navegador.</p>
          </div>
        </div>
        <button
          v-if="isScannerReady"
          @click="toggleCamera"
          class="px-3 py-2 text-sm font-medium text-brand-text-muted hover:text-brand-primary w-full"
        >
          {{ isCameraOn ? "Desligar câmera" : "Ligar câmera" }}
        </button>
      </div>

      <!-- Colar texto da nota fiscal (SEFAZ-RJ) -->
      <div v-if="showPasteMode" class="mt-6 space-y-3">
        <label class="block text-sm font-medium text-brand-text-muted mb-2">
          Cole o texto da nota fiscal (SEFAZ-RJ) ou a chave de acesso (44 dígitos)
        </label>
        <textarea
          v-model="pasteInput"
          rows="5"
          placeholder="Cole aqui o texto completo da nota fiscal ou apenas os 44 dígitos da chave de acesso..."
          class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
        ></textarea>
        <div class="flex gap-2">
          <button
            @click="pasteFromClipboard"
            class="flex-1 btn-primary py-2 text-sm font-medium"
          >
            Colar da Área de Transferência e Processar
          </button>
          <button
            @click="processPasteInput"
            class="flex-1 btn-primary py-2 text-sm font-medium"
          >
            Processar
          </button>
          <button
            @click="showPasteMode = false"
            class="px-3 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>

      <!-- Histórico: últimas notas fiscais importadas -->
      <div v-if="importedInvoices.length > 0" class="mt-6">
        <h4 class="font-medium text-brand-text-primary mb-2">Últimas Notas Fiscais Importadas</h4>
        <div class="space-y-2">
          <div
            v-for="inv in importedInvoices"
            :key="inv.id"
            class="flex items-center justify-between p-2 bg-brand-bg rounded border border-gray-100 text-sm"
          >
            <div>
              <div class="font-medium text-brand-text-primary">{{ inv.storeName }}</div>
              <div class="text-xs text-brand-text-muted">
                {{ inv.issueDate }} · Total {{ formatPrice(inv.totalAmount) }}
              </div>
            </div>
            <button
              @click="openReconciliation(inv)"
              class="text-xs text-brand-primary underline hover:text-brand-accent"
            >
              Conciliar
            </button>
          </div>
        </div>
      </div>

      <!-- Resultado da nota -->
      <div v-if="parsedNfce" class="mt-6 bg-brand-bg rounded-lg p-4 border border-gray-200">
        <h4 class="font-medium text-brand-text-primary mb-2">Nota Fiscal lida</h4>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-brand-text-muted">Estabelecimento:</span>
            <span class="font-medium truncate max-w-[200px]">{{ parsedNfce.storeName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-brand-text-muted">Data:</span>
            <span class="font-medium">{{ parsedNfce.issueDate }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-brand-text-muted">Total:</span>
            <span class="font-medium text-brand-text-primary">R$ {{ formatPrice(parsedNfce.totalAmount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-brand-text-muted">Itens:</span>
            <span class="font-medium">{{ parsedNfce.items.length }}</span>
          </div>
        </div>
        <button
          @click="openReconciliation(parsedNfce)"
          class="mt-3 btn-primary py-2 text-sm font-medium w-full"
        >
          Vincular Insumos e Atualizar Estoque
        </button>
      </div>

      <!-- Erro -->
      <div v-if="scanError" class="mt-6 bg-red-50 border border-red-100 rounded-lg p-3">
        <p class="text-sm text-red-700">{{ scanError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { parseNfceCopiedText } from "@/utils/parseNfceText"
import { invoicesService } from "@/services/invoices"

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(["nfce-scanned", "manual-entry", "close"])

const qrReader = ref(null)
const isScannerReady = ref(false)
const isCameraOn = ref(false)
const scanning = ref(false)
const pasteInput = ref("")
const scanError = ref(null)
const parsedNfce = ref(null)
const importedInvoices = ref([])

const cameraModeActive = ref(false)
const showPasteMode = ref(false)

// Controle de estado real do scanner para evitar "Cannot stop, scanner is not running or paused."
let isScannerRunning = false
let startPromise = null

const formatPrice = (price) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price || 0)

onMounted(() => {
  initScanner()
  loadImportedInvoices()
})

async function loadImportedInvoices() {
  try {
    importedInvoices.value = await invoicesService.list()
  } catch (err) {
    console.warn('[NfceScanner] Não foi carregar notas fiscais importadas.', err.message)
  }
}

onUnmounted(() => {
  stopCameraMode()
})

async function initScanner() {
  if (!Html5Qrcode) {
    scanError.value = "Biblioteca html5-qrcode não carregada."
    return
  }
  try {
    await nextTick()
    if (!document.getElementById("qr-reader")) {
      console.warn("[NfceScannerModal] Elemento qr-reader não encontrado no DOM.")
      return
    }
    qrReader.value = new Html5Qrcode("qr-reader", {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
    })
    isScannerReady.value = true
  } catch (err) {
    scanError.value = "Erro ao inicializar o leitor de QR Code."
    console.error(err)
  }
}

function startCameraMode() {
  cameraModeActive.value = true
  showPasteMode.value = false
  scanError.value = null
  if (isScannerReady.value && !isCameraOn.value) {
    toggleCamera()
  }
}

function stopCameraMode() {
  cameraModeActive.value = false
  stopAndClearScanner()
}

async function toggleCamera() {
  if (!qrReader.value) return
  if (isCameraOn.value) {
    await stopScanner()
  } else {
    await startScanner()
  }
}

async function startScanner() {
  try {
    await nextTick()
    if (!document.getElementById("qr-reader")) {
      scanError.value = "Elemento da câmera não encontrado. Tente novamente."
      return
    }
    startPromise = qrReader.value.start(
      { facingMode: "environment" },
      {
        fps: 15,
        aspectRatio: 1.0,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72)
          return { width: size, height: size }
        },
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      onScanSuccess,
      onScanFailure
    )
    await startPromise
    isScannerRunning = true
    isCameraOn.value = true
    scanning.value = true
  } catch (err) {
    isScannerRunning = false
    scanError.value = "Não foi possível acessar a câmera. Verifique as permissões."
    console.error(err)
  } finally {
    startPromise = null
  }
}

async function stopScanner() {
  if (startPromise) {
    try { await startPromise } catch {}
  }
  if (!qrReader || !isScannerRunning) return
  try {
    await qrReader.value.stop()
    qrReader.value.clear()
  } catch {} finally {
    isScannerRunning = false
    isCameraOn.value = false
    scanning.value = false
  }
}

function stopAndClearScanner() {
  if (!qrReader.value) return
  try {
    if (isScannerRunning) {
      qrReader.value.stop()
    }
    qrReader.value.clear()
  } catch (_) {
    // ignora erro se o scanner não estiver rodando
  } finally {
    isScannerRunning = false
    isCameraOn.value = false
    scanning.value = false
  }
}

function onScanSuccess(decodedText) {
  if (!scanning.value) return
  stopScanner()
  processNfceApi(decodedText)
}

function onScanFailure(error) {
  // Ignore scan errors during continuous scanning
}

async function processPasteInput() {
  if (!pasteInput.value.trim()) return
  const input = pasteInput.value.trim()
  pasteInput.value = ""
  showPasteMode.value = false

  const isAccessKey = /^\d{44}$/.test(input.replace(/\s/g, ""))

  if (isAccessKey) {
    // Chave de acesso sozinha não tem dados de itens via parse client-side.
    // O usuário deve colar o texto completo da nota fiscal (SEFAZ-RJ).
    scanError.value = "Chave de acesso sozinha não contém os itens da nota. Cole o texto completo da nota fiscal (portal SEFAZ-RJ)."
    return
  }

  const result = parseNfceCopiedText(input)
  if (!result.success) {
    scanError.value = result.error
    return
  }

  parsedNfce.value = {
    accessKey: result.accessKey,
    storeName: result.storeName,
    issueDate: result.issueDate,
    totalAmount: result.totalAmount,
    items: result.items.map((item) => ({
      ...item,
      suggestedPackage: item.suggestedPackage || { packageSize: 1, baseUnit: "un", purchaseUnit: "un" },
    })),
    rawUrl: "texto-colado",
  }

  openReconciliation(parsedNfce.value)
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    if (!text || !text.trim()) {
      scanError.value = "Área de transferência vazia."
      return
    }
    pasteInput.value = text.trim()
    await processPasteInput()
  } catch (err) {
    scanError.value = "Não foi possível acessar a área de transferência. Verifique as permissões do navegador."
    console.error(err)
  }
}

function openManualEntry() {
  stopCameraMode()
  emit("manual-entry")
}

function openReconciliation(nfce) {
  stopCameraMode()
  emit("nfce-scanned", nfce)
  closeModal()
}

function closeModal() {
  stopCameraMode()
  stopScanner()
  emit("close")
}
</script>