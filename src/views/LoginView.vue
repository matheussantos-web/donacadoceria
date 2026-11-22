<template>
  <div class="min-h-screen bg-brand-bg flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-brand-surface border border-gray-100 rounded-2xl p-8 shadow-sm">
      <div class="text-center mb-8">
        <img
          :src="logoImg"
          alt="Dona Ca Doceria"
          class="w-16 h-16 mx-auto mb-4"
        />
        <h2 class="font-display font-medium text-2xl text-brand-text-primary">
          Entrar no painel
        </h2>
        <p class="text-brand-text-muted mt-2 text-sm">
          Acesso restrito à administradora do catálogo.
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-brand-text-muted mb-1"
          >
            E-mail
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-brand-text-muted mb-1"
          >
            Senha
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary py-3 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p v-if="error" class="text-sm text-red-600 text-center">{{ error }}</p>
      </form>

      <div class="mt-8 pt-6 border-t border-gray-100 text-center">
        <a
          href="/"
          class="text-brand-primary text-sm font-medium hover:underline transition-colors"
        >
          Voltar ao catálogo público
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import logoImg from '@/assets/logo-donaca.jpg'

const { signIn, isAuthenticated } = useAuth()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Se já estiver logado, redireciona para o admin
if (isAuthenticated()) {
  router.replace('/admin')
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await signIn(email.value, password.value)
    // Redireciona para a rota solicitada ou para o admin por padrão
    router.replace(route.query.redirect || '/admin')
  } catch (err) {
    error.value = err.message || 'Erro ao entrar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
