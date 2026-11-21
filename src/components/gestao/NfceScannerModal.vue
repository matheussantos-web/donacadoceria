<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80" @click.self="closeModal">
    <div class="bg-brand-surface rounded-2xl w-full max-w-md p-6 relative" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display font-medium text-lg text-brand-text-primary">
          Escanear Nota Fiscal (NFC-e)
        </h3>
        <button
          @click="closeModal"
          class="absolute top-2 right-2 p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
          aria-label="Fechar"
        >
          <span class="text-2xl">✕</span>
        </button>
      </div>

      <!-- Câmera / QR Code -->
      <div class="bg-brand-bg border border-gray-200 rounded-lg p-4 aspect-video mb-4 relative overflow-hidden">
        <div id="qr-reader" class="w-full h-full"></div>
        <div
          v-if="!isScannerReady"
          class="absolute inset-0 flex flex-col items-center justify-center text-brand-text-muted"
        >
          <p class="text-sm">Inicializando câmera...</p>
          <p class="text-xs mt-2">Permita o acesso à câmera no navegador.</p>
        </div>
      </div>

      <!-- Controles da câmera -->
      <div class="flex items-center justify-between mb-4">
        <button
          v-if="isScannerReady"
          @click="toggleCamera"
          class="px-3 py-2 text-sm font-medium text-brand-text-muted hover:text-brand-primary"
        >
          {{ isCameraOn ? 'Desligar câmera' : 'Ligar câmera' }}
        </button>
        <button
          @click="showManualInput = true"
          class="px-3 py-2 text-sm font-medium text-brand-primary underline hover:text-brand-accent"
        >
          Colar URL ou chave da nota
        </button>
      </div>

      <!-- Entrada manual -->
      <div v-if="showManualInput" class="mt-4 pb-4 border-t border-gray-100">
        <label class="block text-sm font-medium text-brand-text-muted mb-2">
          URL do QR Code ou chave de acesso (44 dígitos)
        </label>
        <input
          v-model="manualInput"
          type="text"
          placeholder="https://www.sefaz.rj.gov.br/... ou 00000000000000000000000000000000000000000000"
          class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          @keyup.enter="processManualInput"
        />
        <div class="mt-2 flex gap-2">
          <button
            @click="processManualInput"
            class="flex-1 btn-primary py-2 text-sm font-medium"
          >
            Processar
          </button>
          <button
            @click="showManualInput = false"
            class="px-3 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>

      <!-- Resultado da nota -->
      <div v-if="parsedNfce" class="mt-4 bg-brand-bg rounded-lg p-4 border border-gray-200">
        <h4 class="font-medium text-brand-text-primary mb-2">Nota Fiscal lida</h4>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-brand-text-muted">Estabelecimento:</span>
            <span class="font-medium">{{ parsedNfce.storeName }}</span>
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
      <div v-if="scanError" class="mt-4 bg-red-50 border border-red-100 rounded-lg p-3">
        <p class="text-sm text-red-700">{{ scanError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['nfce-scanned'])

const qrReader = ref(null)
const isScannerReady = ref(false)
const isCameraOn = ref(false)
const scanning = ref(false)
const manualInput = ref('')
const scanError = ref(null)
const parsedNfce = ref(null)

const formatPrice = (price) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)

onMounted(() => {
  initScanner()
})

onUnmounted(() => {
  stopScanner()
})

async function initScanner() {
  if (!Html5Qrcode) {
    scanError.value = 'Biblioteca html5-qrcode não carregada.'
    return
  }
  try {
    qrReader.value = new Html5Qrcode('qr-reader', {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    })
    isScannerReady.value = true
  } catch (err) {
    scanError.value = 'Erro ao inicializar o leitor de QR Code.'
    console.error(err)
  }
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
    await qrReader.value.start(
      { facingMode: 'environment' },
      {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72)
          return { width: size, height: size }
        },
        videoConstraints: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      onScanSuccess,
      onScanFailure
    )
    isCameraOn.value = true
    scanning.value = true
  } catch (err) {
    scanError.value = 'Não foi possível acessar a câmera. Verifique as permissões.'
    console.error(err)
  }
}

async function stopScanner() {
  if (!qrReader.value || !isCameraOn.value) return
  try {
    await qrReader.value.stop()
    isCameraOn.value = false
    scanning.value = false
  } catch (err) {
    console.error(err)
  }
}

function onScanSuccess(decodedText) {
  if (!scanning.value) return
  stopScanner()
  processNfceInput(decodedText)
}

function onScanFailure(error) {
  // Ignore scan errors during continuous scanning
}

async function processManualInput() {
  if (!manualInput.value.trim()) return
  processNfceInput(manualInput.value.trim())
  manualInput.value = ''
}

async function processNfceInput(input) {
  scanning.value = false
  scanError.value = null
  parsedNfce.value = null

  try {
    const response = await fetch('/api/parse-nfce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: input }),
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.error || 'Erro ao processar NFC-e')
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Erro ao processar NFC-e')
    }

    parsedNfce.value = data
  } catch (err) {
    scanError.value = err.message || 'Erro ao processar a nota fiscal.'
    scanning.value = true
    if (isCameraOn.value) {
      startScanner()
    }
  }
}

function openReconciliation(nfce) {
  emit('nfce-scanned', nfce)
  closeModal()
}

function closeModal() {
  stopScanner()
  emit('close')
}
</script>