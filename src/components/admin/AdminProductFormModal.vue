<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="closeModal">
    <div
      class="bg-brand-surface border border-gray-100 rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
      @click.stop
    >
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-display font-medium text-lg text-brand-text-primary">
          {{ editingProduct ? 'Editar produto' : 'Novo produto' }}
        </h3>
        <button
          @click="closeModal"
          class="p-2 rounded-lg hover:bg-gray-100 text-brand-text-muted"
          aria-label="Fechar"
        >
          <span class="text-2xl">✕</span>
        </button>
      </div>

      <form @submit.prevent="saveProduct" class="p-6 space-y-6">
        <!-- Nome -->
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Nome do produto
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />
        </div>

        <!-- Descrição -->
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Descrição
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          ></textarea>
        </div>

        <!-- Categoria -->
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Categoria
          </label>
          <select
            v-model="form.category"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          >
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Preço base -->
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Preço base (R$)
          </label>
          <input
            v-model.number="form.basePrice"
            type="number"
            step="0.01"
            min="0"
            required
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />
        </div>

        <!-- Tipo de disponibilidade -->
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Tipo de disponibilidade
          </label>
          <div class="flex gap-1">
            <button
              v-for="status in availabilityStatuses"
              :key="status.value"
              @click="form.availabilityType = status.value"
              :class="[
                'px-3 py-2 text-xs font-medium rounded border transition-colors whitespace-nowrap',
                form.availabilityType === status.value
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                  : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
              ]"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <!-- Antecedência mínima -->
        <div v-if="form.availabilityType === 'order'">
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Antecedência mínima (horas)
          </label>
          <div class="flex gap-2">
            <button
              v-for="h in [0, 24, 48, 72]"
              :key="h"
              @click="form.minAdvanceHours = h"
              :class="[
                'px-3 py-2 text-xs font-medium rounded border transition-colors whitespace-nowrap',
                form.minAdvanceHours === h
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                  : 'border-gray-200 text-brand-text-muted hover:bg-gray-50',
              ]"
            >
              {{ h }}h
            </button>
          </div>
        </div>

        <!-- Vídeo curto opcional -->
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            URL do vídeo curto (opcional)
          </label>
          <input
            v-model="form.videoUrl"
            type="url"
            placeholder="https://exemplo.com/video.mp4"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />
        </div>

        <!-- Fotos -->
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Fotos do produto (múltiplas)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            @change="handleImagesChange"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-muted bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />

          <div v-if="form.images.length > 0" class="mt-3">
            <p class="text-xs text-brand-text-muted mb-2">Fotos atuais:</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(img, idx) in form.images"
                :key="idx"
                class="relative group"
              >
                <img
                  :src="img"
                  :alt="`Foto ${idx + 1}`"
                  class="w-16 h-16 object-cover rounded border border-gray-200"
                />
                <button
                  @click="setCover(idx)"
                  class="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded hover:bg-black/80"
                  :class="form.coverIndex === idx ? 'bg-brand-primary' : ''"
                >
                  {{ form.coverIndex === idx ? 'Capa' : 'Def. capa' }}
                </button>
                <button
                  @click="removeImage(idx)"
                  class="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded hover:bg-red-700"
                  aria-label="Remover foto"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Construtor de Opções -->
        <div class="pt-4 border-t border-gray-100">
          <h4 class="font-medium text-lg text-brand-text-primary mb-3">
            Personalizações (Opções do Produto)
          </h4>
          <p class="text-xs text-brand-text-muted mb-3">
            Crie grupos de opção (ex: "Rendimento em Fatias", "Massa", "Recheios", "Adicionais").
          </p>

          <div
            v-for="(group, gi) in form.optionGroups"
            :key="gi"
            class="space-y-2 mb-6 bg-brand-surface border border-gray-200 rounded-lg p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <input
                  v-model="group.title"
                  type="text"
                  placeholder="Título do grupo"
                  class="text-sm font-medium text-brand-text-primary border-none focus:ring-0 bg-transparent w-full"
                />
                <select
                  v-model="group.type"
                  class="text-xs border border-gray-200 rounded px-2 py-1 bg-brand-bg focus:ring-brand-primary"
                >
                  <option value="single">Escolha única</option>
                  <option value="multiple">Múltipla escolha</option>
                </select>
              </div>
              <button
                @click="removeOptionGroup(gi)"
                class="text-red-600 hover:text-red-800 text-xs"
              >
                Remover grupo
              </button>
            </div>

            <div class="ml-2 space-y-1">
              <div
                v-for="(opt, oi) in group.options"
                :key="oi"
                class="flex items-center gap-2 bg-brand-bg/50 p-2 rounded border border-gray-100"
              >
                <input
                  v-model="opt.name"
                  type="text"
                  placeholder="Nome da opção"
                  class="flex-1 text-sm text-brand-text-primary border-none focus:ring-0 bg-transparent"
                />
                <input
                  v-model.number="opt.priceDelta"
                  type="number"
                  step="0.01"
                  placeholder="+R$ 0,00"
                  class="w-24 text-sm text-brand-text-primary border-none focus:ring-0 bg-transparent text-right"
                />
                <label class="flex items-center gap-1 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    v-model="opt.available"
                    class="rounded border-brand-primary text-brand-primary focus:ring-brand-primary"
                  />
                  Ativo
                </label>
                <button
                  @click="removeOption(gi, oi)"
                  class="text-red-600 hover:text-red-800 text-xs"
                >
                  ✕
                </button>
              </div>
              <button
                @click="addOption(gi)"
                class="text-xs text-brand-primary underline hover:text-brand-accent ml-1"
              >
                + Adicionar opção
              </button>
            </div>
          </div>

          <button
            @click="addOptionGroup"
            class="btn-secondary px-4 py-2 text-sm font-medium"
          >
            + Novo grupo de opções
          </button>
        </div>

        <!-- Status gerais -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <input
              id="isFeatured"
              v-model="form.isFeatured"
              type="checkbox"
              class="rounded border-brand-primary text-brand-primary focus:ring-brand-primary"
            />
            <label for="isFeatured" class="text-sm text-brand-text-muted">
              Destaque na Home
            </label>
          </div>
          <div class="flex items-center gap-2">
            <input
              id="isNew"
              v-model="form.isNew"
              type="checkbox"
              class="rounded border-brand-primary text-brand-primary focus:ring-brand-primary"
            />
            <label for="isNew" class="text-sm text-brand-text-muted">
              Marcar como novidade
            </label>
          </div>
          <div class="flex items-center gap-2">
            <input
              id="available"
              v-model="form.available"
              type="checkbox"
              class="rounded border-brand-primary text-brand-primary focus:ring-brand-primary"
            />
            <label for="available" class="text-sm text-brand-text-muted">
              Disponível para venda
            </label>
          </div>
        </div>

        <!-- Ações -->
        <div class="flex items-center justify-end gap-3 pt-6">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
          >
            {{ saving ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { productService } from '@/services/products'

const props = defineProps({
  product: { type: Object | null, default: null },
})

const emit = defineEmits(['saved', 'close'])

const editingProduct = computed(() => props.product !== null)
const saving = ref(false)

const availabilityStatuses = [
  { value: 'ready', label: 'Pronta Entrega' },
  { value: 'order', label: 'Sob Encomenda' },
  { value: 'paused', label: 'Esgotado' },
]

const form = ref({
  name: '',
  description: '',
  basePrice: '',
  category: 'Pronta Entrega',
  availabilityType: 'ready',
  minAdvanceHours: 0,
  videoUrl: '',
  images: [],
  optionGroups: [],
  isFeatured: false,
  isNew: true,
  available: true,
  coverIndex: 0,
})

const categories = computed(() => [])

const newFiles = ref([])

async function initForm() {
  if (props.product) {
    form.value = {
      name: props.product.name,
      description: props.product.description,
      basePrice: props.product.basePrice,
      category: props.product.category,
      availabilityType: props.product.availabilityType,
      minAdvanceHours: props.product.minAdvanceHours,
      videoUrl: props.product.videoUrl || '',
      images: [...(props.product.images || [])],
      optionGroups: props.product.optionGroups
        ? props.product.optionGroups.map((g) => ({
            id: g.id,
            title: g.title,
            type: g.type,
            required: g.required,
            minChoices: g.minChoices,
            maxChoices: g.maxChoices,
            displayOrder: g.displayOrder,
            options: (g.options || []).map((o) => ({
              id: o.id,
              name: o.name,
              priceDelta: o.priceDelta,
              available: o.available,
              displayOrder: o.displayOrder,
            })),
          }))
        : [],
      isFeatured: props.product.isFeatured,
      isNew: props.product.isNew,
      available: props.product.available,
      coverIndex: 0,
    }
  }
}

async function saveProduct() {
  if (!form.value.name || form.value.basePrice === '') return

  saving.value = true

  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
      basePrice: parseFloat(form.value.basePrice),
      category: form.value.category,
      availabilityType: form.value.availabilityType,
      minAdvanceHours: form.value.minAdvanceHours,
      videoUrl: form.value.videoUrl,
      images: [...form.value.images],
      optionGroups: form.value.optionGroups.map((g) => ({
        title: g.title,
        type: g.type,
        required: g.required,
        minChoices: g.minChoices,
        maxChoices: g.maxChoices,
        displayOrder: g.displayOrder,
        options: g.options.map((o) => ({
          name: o.name,
          priceDelta: o.priceDelta || 0,
          available: o.available,
          displayOrder: o.displayOrder,
        })),
      })),
      isFeatured: form.value.isFeatured,
      isNew: form.value.isNew,
      available: form.value.available,
      displayOrder: Math.floor(Date.now() / 1000),
    }

    if (props.product) {
      await productService.update(props.product.id, payload)
    } else {
      await productService.create(payload)
    }

    saving.value = false
    emit('saved')
  } catch (err) {
    saving.value = false
    alert(err.message || 'Erro ao salvar produto.')
  }
}

async function handleImagesChange(event) {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return
  const newItems = []
  for (const file of files) {
    const preview = URL.createObjectURL(file)
    newItems.push({ file, preview })
  }
  newFiles.value = [...newFiles.value, ...newItems]
}

function removeImage(idx) {
  form.value.images.splice(idx, 1)
  if (form.value.coverIndex >= form.value.images.length) {
    form.value.coverIndex = Math.max(0, form.value.images.length - 1)
  }
}

function setCover(idx) {
  form.value.coverIndex = idx
}

function addOptionGroup() {
  form.value.optionGroups.push({
    id: Date.now(),
    title: 'Novo grupo',
    type: 'single',
    required: false,
    minChoices: 0,
    maxChoices: 1,
    displayOrder: form.value.optionGroups.length,
    options: [],
  })
}

function removeOptionGroup(gi) {
  form.value.optionGroups.splice(gi, 1)
}

function addOption(gi) {
  form.value.optionGroups[gi].options.push({
    id: Date.now(),
    name: 'Nova opção',
    priceDelta: 0,
    available: true,
    displayOrder: form.value.optionGroups[gi].options.length,
  })
}

function removeOption(gi, oi) {
  form.value.optionGroups[gi].options.splice(oi, 1)
}

function closeModal() {
  emit('close')
}

initForm()
</script>
