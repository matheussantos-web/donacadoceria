<script setup>
import { storeConfig, getWhatsAppUrl, isWhatsAppConfigured } from '@/config/store'
import WhatsAppIcon from '@/components/WhatsAppIcon.vue'
import { Instagram, Menu, X } from 'lucide-vue-next'
import { ref } from 'vue'
import logoImg from '@/assets/logo-donaca.jpg'

const whatsappUrl = getWhatsAppUrl()
const currentYear = new Date().getFullYear()
const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-brand-bg">
    <!-- Banner global de aviso da loja -->
    <div
      v-if="storeConfig.announcementActive && storeConfig.announcementText"
      class="bg-brand-primary text-white text-center px-4 py-2"
    >
      <p class="text-xs font-medium">{{ storeConfig.announcementText }}</p>
    </div>

    <!-- Header -->
    <header class="bg-brand-surface border-b border-gray-100 sticky top-0 z-40">
      <div class="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <a
          href="/"
          class="flex items-center gap-3"
          aria-label="Dona Cá Doceria - Início"
        >
          <img :src="logoImg" alt="" class="w-10 h-10" />
          <span
            class="font-display font-medium text-brand-text-primary text-sm hidden sm:block"
            >Dona Cá Doceria</span
          >
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-6">
          <a
            href="#catalogo"
            class="text-brand-text-muted hover:text-brand-primary transition-colors text-sm font-medium"
            >Catálogo</a
          >
          <a
            href="#contato"
            class="text-brand-text-muted hover:text-brand-primary transition-colors text-sm font-medium"
            >Contato</a
          >
        </nav>

        <!-- Desktop WhatsApp -->
        <div class="hidden md:flex items-center gap-3">
          <a
            v-if="isWhatsAppConfigured"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary text-sm inline-flex"
            aria-label="Abrir atendimento no WhatsApp"
          >
            <WhatsAppIcon class="w-5 h-5 mr-2" /> WhatsApp
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2 rounded-lg text-brand-text-muted hover:bg-gray-100"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-expanded="mobileMenuOpen"
          aria-label="Abrir menu"
          aria-controls="mobile-menu"
        >
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6" aria-hidden="true" />
          <X v-else class="w-6 h-6" aria-hidden="true" />
        </button>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden fixed inset-0 z-50 bg-brand-surface border-b border-gray-100"
      id="mobile-menu"
      role="navigation"
      aria-label="Menu mobile"
    >
      <div class="flex flex-col p-4 space-y-4 pt-16">
        <a
          href="#top"
          class="text-brand-text-primary font-medium text-lg py-2 border-b border-gray-100"
          @click="mobileMenuOpen = false"
          >Início</a
        >
        <a
          href="#catalogo"
          class="text-brand-text-muted hover:text-brand-primary transition-colors text-lg py-2 border-b border-gray-100"
          @click="mobileMenuOpen = false"
          >Catálogo</a
        >
        <a
          href="#contato"
          class="text-brand-text-muted hover:text-brand-primary transition-colors text-lg py-2 border-b border-gray-100"
          @click="mobileMenuOpen = false"
          >Contato</a
        >
        <a
          v-if="isWhatsAppConfigured"
          :href="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary text-center py-3"
          @click="mobileMenuOpen = false"
        >
          <div class="flex items-center justify-center gap-2">
            <WhatsAppIcon class="w-5 h-5" />
            <span>Falar no WhatsApp</span>
          </div>
        </a>
        <a
          v-else
          :href="`mailto:${storeConfig.contactEmail}`"
          class="btn-secondary text-center py-3"
        >
          Enviar e-mail
        </a>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="relative py-12 sm:py-16 px-4">
      <div class="max-w-screen-xl mx-auto text-center">
        <!-- Logo no lugar do h1 -->
        <img
          :src="logoImg"
          alt="Dona Cá Doceria"
          class="h-48 sm:h-60 w-auto mx-auto object-contain mb-6"
          aria-hidden="true"
        />
        <span class="sr-only">Dona Cá Doceria — Confeitaria Artesanal</span>

        <p class="text-lg sm:text-xl text-brand-text-muted font-light mb-6 max-w-2xl mx-auto text-balance">
          Doces feitos com afeto, prontos para adoçar seu momento!
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            v-if="isWhatsAppConfigured"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary text-lg px-8 py-4"
          >
            <WhatsAppIcon class="w-6 h-6 mr-2" /> Falar com a Dona Cá
          </a>
          <a
            v-else
            href="#catalogo"
            class="btn-secondary text-lg px-8 py-4"
            >Ver catálogo</a
          >
        </div>
      </div>

      <!-- Decorative elements -->
      <div
        class="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          class="absolute top-1/4 left-0 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl"
        />
        <div
          class="absolute bottom-1/4 right-0 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl"
        />
      </div>
    </section>

    <!-- Conteúdo da rota (catálogo público ou painel) -->
    <slot />

    <!-- Contact/CTA Section -->
    <section id="contato" class="py-12 px-4 bg-brand-surface">
      <div class="max-w-screen-xl mx-auto text-center">
        <h2 class="font-display font-medium text-2xl sm:text-3xl text-brand-text-primary mb-3">
          Fale Conosco
        </h2>
        <p class="text-brand-text-muted mb-6 max-w-xl mx-auto">
          Tem dúvidas, quer fazer um pedido ou saber mais sobre nossos doces?
          Estamos à disposição para atender você.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            v-if="isWhatsAppConfigured"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary text-base px-6 py-3 w-full sm:w-auto"
          >
            <WhatsAppIcon class="w-5 h-5 mr-2" /> WhatsApp
          </a>
          <a
            v-else
            :href="`mailto:${storeConfig.contactEmail}`"
            class="btn-secondary text-base px-6 py-3 w-full sm:w-auto"
          >
            Enviar e-mail
          </a>
          <a
            v-if="storeConfig.instagramUrl"
            :href="storeConfig.instagramUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-secondary text-base px-6 py-3 w-full sm:w-auto"
            aria-label="Instagram"
          >
            <Instagram class="w-5 h-5 mr-2" aria-hidden="true" /> Instagram
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-brand-surface border-t border-gray-100 py-6 px-4">
      <div class="max-w-screen-xl mx-auto">
        <div
          class="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-brand-text-muted"
        >
          <p class="font-display font-medium text-brand-text-primary">
            {{ storeConfig.storeName }}
          </p>
          <p>© {{ currentYear }} Todos os direitos reservados.</p>
          <div class="flex items-center gap-4">
            <a
              v-if="storeConfig.instagramUrl"
              :href="storeConfig.instagramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-brand-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram class="w-5 h-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
