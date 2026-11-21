<template>
  <div class="space-y-6">
    <!-- Aviso no Topo da Vitrine -->
    <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
      <h2 class="font-display font-medium text-lg text-brand-text-primary mb-4">
        Aviso no Topo da Vitrine
      </h2>
      <div class="flex items-center gap-3 mb-4">
        <input
          id="announcementActive"
          v-model="settings.announcementActive"
          type="checkbox"
          class="rounded border-brand-primary text-brand-primary focus:ring-brand-primary"
        />
        <label for="announcementActive" class="text-sm font-medium text-brand-text-primary">
          Exibir banner de aviso no topo do site
        </label>
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-text-muted mb-1">
          Texto do banner
        </label>
        <input
          v-model="settings.announcementText"
          type="text"
          placeholder="Ex: Agenda de encomendas aberta! Entregas até sexta."
          class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
        />
      </div>
    </div>

    <!-- Funcionamento & Retirada -->
    <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
      <h2 class="font-display font-medium text-lg text-brand-text-primary mb-4">
        Funcionamento &amp; Retirada
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Status da loja
          </label>
          <div class="flex items-center gap-2">
            <input
              id="isOpen"
              v-model="settings.isOpen"
              type="checkbox"
              class="rounded border-brand-primary text-brand-primary focus:ring-brand-primary"
            />
            <label for="isOpen" class="text-sm font-medium text-brand-text-primary">
              Loja aberta para pedidos
            </label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Horário de retirada
          </label>
          <input
            v-model="settings.pickupHours"
            type="text"
            placeholder="Ex: Ter a Sex, 9h às 18h"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Endereço do ateliê
          </label>
          <input
            v-model="settings.pickupAddress"
            type="text"
            placeholder="Ex: Rua das Flores, 123 - Bairro, Cidade/UF"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Chave Pix
          </label>
          <input
            v-model="settings.pixKey"
            type="text"
            placeholder="Ex: email@exemplo.com ou CPF"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Contato -->
    <div class="bg-brand-surface border border-gray-100 rounded-xl p-6">
      <h2 class="font-display font-medium text-lg text-brand-text-primary mb-4">
        Contato
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            WhatsApp (apenas dígitos)
          </label>
          <input
            v-model="settings.whatsappNumber"
            type="text"
            placeholder="5521999999999"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            Instagram
          </label>
          <input
            v-model="settings.instagramUrl"
            type="url"
            placeholder="https://www.instagram.com/usuario/"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-brand-text-muted mb-1">
            E-mail de contato
          </label>
          <input
            v-model="settings.contactEmail"
            type="email"
            placeholder="contato@donacadoceria.com.br"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-brand-text-primary bg-brand-bg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-6">
      <button
        @click="$emit('saved')"
        class="btn-primary px-6 py-2 text-sm font-medium"
      >
        Salvar configurações
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  settings: { type: Object, required: true },
})
</script>
