<script setup>
import { onMounted } from 'vue'
import { productService } from '@/services/products'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(async () => {
  const code = route.params.code
  if (!code) {
    document.body.innerHTML = '<div style="font-family:sans-serif;padding:2rem;text-align:center;color:#231F20">Código inválido.</div>'
    return
  }

  try {
    const products = await productService.list()
    const product = products.find(
      (p) => p.id && String(p.id).slice(0, 6).toLowerCase() === String(code).toLowerCase()
    )

    const photoUrl = product
      ? product.imageUrl || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null)
      : null

    if (photoUrl) {
      window.location.replace(photoUrl)
    } else {
      document.body.innerHTML = `
        <div style="font-family:sans-serif;padding:2rem;max-width:32rem;margin:0 auto;text-align:center;color:#231F20">
          <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem">Foto não encontrada</h2>
          <p style="color:#665E60;margin-bottom:1rem">Não há imagem disponível para este código.</p>
          <a href="/" style="color:#C46D7C;text-decoration:none;font-weight:500">← Voltar ao catálogo</a>
        </div>
      `
    }
  } catch (err) {
    document.body.innerHTML = `
      <div style="font-family:sans-serif;padding:2rem;max-width:32rem;margin:0 auto;text-align:center;color:#231F20">
        <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem">Erro ao carregar</h2>
        <p style="color:#665E60;margin-bottom:1rem">Tente novamente em instantes.</p>
        <a href="/" style="color:#C46D7C;text-decoration:none;font-weight:500">← Voltar ao catálogo</a>
      </div>
    `
  }
})
</script>

<template>
  <div class="min-h-screen bg-brand-bg flex items-center justify-center">
    <div class="text-center">
      <p class="text-brand-text-muted">Redirecionando para a foto...</p>
    </div>
  </div>
</template>
