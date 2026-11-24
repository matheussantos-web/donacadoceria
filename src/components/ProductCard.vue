<script setup>
import { ref, computed } from 'vue'
import { useMotion } from '@vueuse/motion'
import { formatPrice } from '@/data/products'
import { useWhatsAppStatus } from '@/composables/useWhatsAppLink'
import { Image, AlertTriangle } from 'lucide-vue-next'
import ProductCustomizerModal from '@/components/catalog/ProductCustomizerModal.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  selectedCategory: {
    type: String,
    default: 'Todas',
  },
})

const whatsappStatus = useWhatsAppStatus()

const currentImageIndex = ref(0)
const showCustomizer = ref(false)
const motionProps = () => ({
  initial: { y: 20, opacity: 0 },
  enter: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 }},
  hover: { y: -5, scale: 1.02 },
  tap: { scale: 0.98 },
})

const productImages = computed(() => {
  const imgs = props.product.images || []
  if (imgs.length > 0) return imgs
  return props.product.imageUrl ? [props.product.imageUrl] : []
})

const hasMultipleImages = computed(() => productImages.value.length > 1)

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % productImages.value.length
}

const prevImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + productImages.value.length) % productImages.value.length
}

const handleImageError = (event) => {
  event.target.src = '/images/placeholder-product.svg'
  event.target.onerror = null
}
</script>

<template>
  <article v-motion="motionProps" class="card group relative flex flex-col h-full bg-brand-surface border-brand-primary/10 shadow-sm hover:shadow-xl transition-shadow duration-300">
    <!-- Image container with aspect ratio -->
    <div class="relative aspect-[4/5] overflow-hidden bg-gray-100">
      <!-- Image carousel when multiple images -->
      <div v-if="hasMultipleImages" class="absolute inset-0 flex items-center justify-center">
        <button
          @click="prevImage"
          class="absolute left-2 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 transition-colors z-20"
          aria-label="Foto anterior"
        >
          <span class="text-xl font-bold leading-none">‹</span>
        </button>
        <button
          @click="nextImage"
          class="absolute right-2 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 transition-colors z-20"
          aria-label="Próxima foto"
        >
          <span class="text-xl font-bold leading-none">›</span>
        </button>
        <!-- Image indicators -->
        <div class="absolute bottom-2 flex gap-1 z-20">
          <button
            v-for="(_, idx) in productImages"
            :key="idx"
            @click="currentImageIndex = idx"
            :class="[
              'w-2 h-2 rounded-full transition-colors',
              currentImageIndex === idx
                ? 'bg-brand-primary'
                : 'bg-white/60 hover:bg-white',
            ]"
            aria-label="Selecionar foto"
          />
        </div>
      </div>

      <img
        v-if="productImages.length > 0"
        :src="productImages[currentImageIndex]"
        :alt="product.name"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        @error="handleImageError"
        loading="lazy"
      />
      <!-- Fallback placeholder shown while loading or on error -->
      <div v-else class="absolute inset-0 flex items-center justify-center text-gray-300" aria-hidden="true">
        <Image class="w-16 h-16" stroke-width="1.5" aria-hidden="true" />
      </div>

      <!-- Novo badge -->
      <div v-if="product.isNew" class="absolute top-2 left-2 z-10">
        <span class="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-brand-primary rounded-full">
          Novo
        </span>
      </div>

      <!-- Badge de disponibilidade -->
      <span
        v-if="product.availabilityType"
        class="absolute top-2 right-2 z-10 inline-flex items-center px-2 py-1 text-[10px] font-medium rounded-full uppercase"
        :class="{
          'bg-brand-accent text-white': product.availabilityType === 'ready',
          'bg-brand-secondary text-white': product.availabilityType === 'order',
          'bg-gray-400 text-white': product.availabilityType === 'paused',
        }"
      >
        {{
          product.availabilityType === 'ready'
            ? 'Pronta Entrega'
            : product.availabilityType === 'order'
            ? 'Sob Encomenda'
            : 'Esgotado'
        }}
      </span>
    </div>

    <!-- Content -->
    <div class="flex flex-col flex-1 p-4 space-y-3">
      <!-- Category -->
      <span class="text-xs font-medium text-brand-primary uppercase tracking-wide">
        {{ product.category }}
      </span>

      <!-- Title -->
      <h3 class="font-display font-medium text-lg text-brand-text-primary line-clamp-2">
        {{ product.name }}
      </h3>

      <!-- Description -->
      <p class="text-sm text-brand-text-muted line-clamp-3 flex-1">
        {{ product.description }}
      </p>

      <!-- Botão Personalizar / Encomendar -->
      <div class="flex flex-col gap-3 pt-2 border-t border-gray-100">
        <span class="font-display font-medium text-xl text-brand-text-primary">
          {{ formatPrice(product.price) }}
        </span>
        <button
          type="button"
          class="w-full btn-primary text-sm py-3 whitespace-nowrap text-center" v-motion="{ initial: { scale: 1 }, tap: { scale: 0.95 } }"
          :disabled="!product.available || !whatsappStatus.isConfigured"
          @click="showCustomizer = true"
        >
          <span v-if="whatsappStatus.isConfigured">
            {{ product.availabilityType === 'paused' ? 'Esgotado' : 'Personalizar / Encomendar' }}
          </span>
          <span v-else class="flex items-center justify-center gap-1">
            <AlertTriangle class="w-4 h-4" aria-hidden="true" />
            Configurar WhatsApp
          </span>
        </button>
      </div>
    </div>

    <!-- Product Customizer Modal -->
    <ProductCustomizerModal
      v-if="showCustomizer"
      :product="product"
      @added="showCustomizer = false"
      @close="showCustomizer = false"
    />
  </article>
</template>