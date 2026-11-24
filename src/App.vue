<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '@/composables/useCart'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()
const { addItem } = useCart()

onMounted(() => {
  window.addEventListener('donaca:add-to-cart', (e) => {
    addItem(e.detail)
  })
})

const currentLayout = computed(() => {
  return route.meta?.layout === 'auth' ? AuthLayout : DefaultLayout
})
</script>

<template>
  <component :is="currentLayout">
    <router-view />
  </component>
</template>