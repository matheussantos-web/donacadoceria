<template>
  <div class="min-h-screen bg-brand-bg">
    <header class="bg-brand-surface border-b border-gray-100 px-4 py-4">
      <div class="max-w-screen-xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img :src="logoImg" class="h-8 w-auto mr-3" />
          <span class="font-display font-medium text-lg text-brand-text-primary">
            Painel Administrativo
          </span>
        </div>
        <button @click="logout" class="text-sm text-brand-text-muted hover:text-brand-primary transition-colors">Sair</button>
        <button @click="$router.push('/gestao')" class="btn-primary text-sm px-4 py-2 font-medium">Gestão</button>
      </div>
    </header>
    <div class="max-w-screen-xl mx-auto px-4 py-8">
      <div class="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto pb-2">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="['px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors', activeTab === tab.key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-text-muted hover:text-brand-primary']">{{ tab.label }}</button>
      </div>
      <div v-if="activeTab === 'vitrine'" class="space-y-6">
        <div class="flex items-center justify-between mb-4">
          <h1 class="font-display font-medium text-2xl text-brand-text-primary">Vitrine & Produtos</h1>
          <button @click="showProductModal()" class="btn-primary px-4 py-2 text-sm font-medium">+ Novo produto</button>
        </div>
        <p v-if="loading" class="text-brand-text-muted text-center py-8">Carregando produtos...</p>
        <div v-else-if="error" class="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm mb-6">{{ error }}</div>
        <div v-else-if="products.length === 0" class="py-16 text-center"><p class="text-brand-text-muted">Nenhum produto cadastrado.</p><button @click="showProductModal()" class="btn-primary mt-4 px-4 py-2">Cadastrar primeiro produto</button></div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminProductCard v-for="product in products" :key="product.id" :product="product" @update-product="loadProducts" @delete-product="deleteProduct" @edit-product="showProductModal" />
        </div>
      </div>
      <div v-if="activeTab === 'categorias'" class="space-y-6">
        <h2 class="font-display font-medium text-xl text-brand-text-primary">Categorias</h2>
        <p class="text-brand-text-muted">Gerencie as categorias da vitrine. Estas aparecem nos filtros do catálogo público.</p>
        <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
          <div class="flex gap-3 mb-4">
            <input v-model="newCategory.name" type="text" placeholder="Nome da categoria" class="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
            <input v-model="newCategory.slug" type="text" placeholder="slug-da-categoria" class="w-48 px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
            <button @click="createCategory" class="btn-primary px-4 py-2 text-sm font-medium">Criar</button>
          </div>
          <div v-if="categories.length === 0" class="text-center py-8 text-brand-text-muted">Nenhuma categoria cadastrada.</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="cat in categories" :key="cat.id" class="bg-brand-bg border border-gray-100 rounded-lg p-4 flex items-center justify-between"><div><span class="font-medium text-brand-text-primary">{{ cat.name }}</span><p class="text-xs text-brand-text-muted mt-1">{{ cat.slug }}</p></div><button @click="deleteCategory(cat.id)" class="text-red-600 hover:text-red-800 text-xs">Excluir</button></div>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'configuracoes'" class="space-y-6">
        <h2 class="font-display font-medium text-xl text-brand-text-primary">Configurações da Loja</h2>
        <AdminStoreSettingsForm :settings="settings" @saved="saveSettings" />
      </div>
      <AdminProductFormModal v-if="showProductForm" :product="editingProduct" @saved="onProductSaved" @close="showProductForm = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { productService } from '@/services/products'
import { categoryService } from '@/services/categories'
import { storeSettingsService } from '@/services/storeSettings'
import { useAuth } from '@/composables/useAuth'
import AdminProductCard from '@/components/admin/AdminProductCard.vue'
import AdminProductFormModal from '@/components/admin/AdminProductFormModal.vue'
import AdminStoreSettingsForm from '@/components/admin/AdminStoreSettingsForm.vue'
import logoImg from '@/assets/logo-donaca.jpg'
const { signOut } = useAuth()
const tabs = [
  { key: 'vitrine', label: 'Vitrine & Produtos' },
  { key: 'categorias', label: 'Categorias' },
  { key: 'configuracoes', label: 'Configurações' },
]
const activeTab = ref('vitrine')
const showProductForm = ref(false)
const editingProduct = ref(null)
const products = ref([])
const categories = ref([])
const settings = ref(null)
const loading = ref(true)
const error = ref('')
const newCategory = ref({ name: '', slug: '' })
async function loadData() {
  loading.value = true
  error.value = ''
  try { await Promise.all([loadProducts(), loadCategories(), loadSettings()]) } catch (err) { error.value = err.message || 'Erro ao carregar dados.' } finally { loading.value = false }
}
async function loadProducts() { products.value = await productService.list() }
async function loadCategories() { categories.value = await categoryService.list() }
async function loadSettings() { settings.value = await storeSettingsService.get() || { storeName: 'Dona Ca Doceria — Confeitaria Artesanal', whatsappNumber: '', instagramUrl: '', contactEmail: '', isOpen: true, announcementText: '', announcementActive: false, pickupAddress: '', pickupHours: '', pixKey: '' } }
async function logout() { await signOut() }
function showProductModal(product = null) { editingProduct.value = product; showProductForm.value = true }
async function onProductSaved() { showProductForm.value = false; editingProduct.value = null; await loadProducts() }
async function deleteProduct(id) { if (!confirm('Excluir este produto?')) return; try { await productService.remove(id); await loadProducts() } catch (err) { error.value = err.message || 'Erro ao excluir produto.' } }
async function createCategory() { if (!newCategory.value.name || !newCategory.value.slug) return; try { await categoryService.create({ name: newCategory.value.name, slug: newCategory.value.slug, displayOrder: categories.value.length, active: true }); newCategory.value = { name: '', slug: '' }; await loadCategories() } catch (err) { error.value = err.message || 'Erro ao criar categoria.' } }
async function deleteCategory(id) { if (!confirm('Excluir esta categoria?')) return; try { await categoryService.remove(id); await loadCategories() } catch (err) { error.value = err.message || 'Erro ao excluir categoria.' } }
async function saveSettings() { if (!settings.value) return; try { await storeSettingsService.update(settings.value) } catch (err) { error.value = err.message || 'Erro ao salvar configurações.' } }
onMounted(() => { loadData() })
</script>
