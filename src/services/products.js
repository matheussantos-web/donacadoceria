/**
 * Camada de dados de produtos para a v2 — Dona Ca Doceria.
 *
 * Estratégia:
 * - Se o Supabase estiver configurado e a tabela `products` existir, lê/escreve no Postgres.
 * - Caso contrário, cai de volta para o catálogo estático em `src/data/products.js`
 *   para não quebrar a experiência pública da v1.
 *
 * Colunas do Supabase (snake_case) -> front (camelCase):
 *   id, name, description, base_price, availability_type, min_advance_hours,
 *   is_featured, image_url, images, video_url, category_id, display_order,
 *   created_at, updated_at
 */

/** Comprime uma imagem via Canvas API para WebP antes do upload. */
/**
 * Comprime um arquivo de imagem para WebP (máx. 1200px, qualidade 0.85).
 * @param {File} file - Arquivo original
 * @param {number} [maxWidth=1200] - Largura máxima
 * @param {number} [quality=0.85] - Qualidade do WebP (0 a 1)
 * @returns {Promise<File>} Arquivo comprimido em WebP
 */
async function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      URL.revokeObjectURL(url)

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Falha ao comprimir imagem.'))
          const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          })
          resolve(webpFile)
        },
        'image/webp',
        quality,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Falha ao carregar imagem para compressão.'))
    }
    img.src = url
  })
}

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { products as fallbackProducts, formatPrice } from '@/data/products'

function toProduct(row) {
  const images = Array.isArray(row.images) ? row.images : []
  const imageUrl = row.image_url || (images.length > 0 ? images[0] : '')
  const groups = Array.isArray(row.product_option_groups) ? row.product_option_groups : []
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.base_price),
    basePrice: Number(row.base_price),
    availabilityType: row.availability_type,
    minAdvanceHours: row.min_advance_hours,
    isFeatured: row.is_featured,
    imageUrl,
    images,
    videoUrl: row.video_url,
    categoryId: row.category_id,
    category: row.category,
    isNew: row.is_new ?? true,
    available: row.available ?? true,
    optionGroups: groups.map((g) => ({
      id: g.id,
      title: g.title,
      type: g.type,
      required: g.required,
      minChoices: g.min_choices,
      maxChoices: g.max_choices,
      displayOrder: g.display_order,
      options: Array.isArray(g.product_options)
        ? g.product_options.map((o) => ({
            id: o.id,
            name: o.name,
            priceDelta: Number(o.price_delta),
            available: o.available,
            displayOrder: o.display_order,
          }))
        : [],
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toRow(product) {
  const images = Array.isArray(product.images) ? product.images : []
  return {
    name: product.name,
    description: product.description,
    base_price: product.basePrice ?? product.price,
    availability_type: product.availabilityType ?? 'ready',
    min_advance_hours: product.minAdvanceHours ?? 0,
    is_featured: product.isFeatured ?? false,
    image_url: images.length > 0 ? images[0] : null,
    images,
    video_url: product.videoUrl || null,
    category_id: product.categoryId || null,
    display_order: product.displayOrder ?? 0,
    is_new: product.isNew ?? true,
    available: product.available ?? true,
  }
}

export const productService = {
  /** Lista produtos ordenados por criação (mais novo primeiro), com grupos e opções. */
  async list() {
    if (!isSupabaseConfigured()) {
      return fallbackProducts.map((p) => ({
        ...p,
        imageUrl: p.imageUrl,
        isNew: p.isNew,
        available: p.available,
        optionGroups: [],
      }))
    }
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_option_groups (
          *,
          product_options (*)
        )
      `)
      .order('created_at', { ascending: false })
    if (error) {
      console.warn('[products] Supabase indisponível, usando fallback estático.', error.message)
      return fallbackProducts.map((p) => ({ ...p }))
    }
    return (data || []).map(toProduct)
  },

  /** Busca um produto pelo id, com grupos e opções. */
  async get(id) {
    if (!isSupabaseConfigured()) {
      return fallbackProducts.find((p) => p.id === id) || null
    }
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_option_groups (
          *,
          product_options (*)
        )
      `)
      .eq('id', id)
      .single()
    if (error) return null
    return data ? toProduct(data) : null
  },

  /** Cria um produto com grupos e opções (requer autenticação + RLS). */
  async create(product) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const groups = Array.isArray(product.optionGroups) ? product.optionGroups : []
    const productPayload = toRow(product)
    delete productPayload.optionGroups

    const { data, error } = await supabase
      .from('products')
      .insert(productPayload)
      .select()
      .single()
    if (error) throw error
    const created = data

    if (groups.length > 0) {
      const groupsPayload = groups.map((g) => ({
        product_id: created.id,
        title: g.title,
        type: g.type,
        required: g.required ?? false,
        min_choices: g.minChoices ?? 0,
        max_choices: g.maxChoices ?? 1,
        display_order: g.displayOrder ?? 0,
      }))
      const { data: groupsData, error: groupsError } = await supabase
        .from('product_option_groups')
        .insert(groupsPayload)
        .select(`
          *,
          product_options (*)
        `)
      if (groupsError) throw groupsError

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        const createdGroup = groupsData[i]
        const options = Array.isArray(group.options) ? group.options : []
        if (options.length > 0) {
          const optionsPayload = options.map((o) => ({
            group_id: createdGroup.id,
            name: o.name,
            price_delta: o.priceDelta ?? 0,
            available: o.available ?? true,
            display_order: o.displayOrder ?? 0,
          }))
          const { error: optionsError } = await supabase
            .from('product_options')
            .insert(optionsPayload)
          if (optionsError) throw optionsError
        }
      }
    }

    return this.get(created.id)
  },

  /** Atualiza um produto com grupos e opções (requer autenticação + RLS). */
  async update(id, product) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const groups = Array.isArray(product.optionGroups) ? product.optionGroups : []
    const productPayload = toRow(product)
    delete productPayload.optionGroups

    const { data, error } = await supabase
      .from('products')
      .update(productPayload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    const { error: delError } = await supabase
      .from('product_option_groups')
      .delete()
      .eq('product_id', id)
    if (delError) throw delError

    if (groups.length > 0) {
      const groupsPayload = groups.map((g) => ({
        product_id: id,
        title: g.title,
        type: g.type,
        required: g.required ?? false,
        min_choices: g.minChoices ?? 0,
        max_choices: g.maxChoices ?? 1,
        display_order: g.displayOrder ?? 0,
      }))
      const { data: groupsData, error: groupsError } = await supabase
        .from('product_option_groups')
        .insert(groupsPayload)
        .select(`
          *,
          product_options (*)
        `)
      if (groupsError) throw groupsError

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        const createdGroup = groupsData[i]
        const options = Array.isArray(group.options) ? group.options : []
        if (options.length > 0) {
          const optionsPayload = options.map((o) => ({
            group_id: createdGroup.id,
            name: o.name,
            price_delta: o.priceDelta ?? 0,
            available: o.available ?? true,
            display_order: o.displayOrder ?? 0,
          }))
          const { error: optionsError } = await supabase
            .from('product_options')
            .insert(optionsPayload)
          if (optionsError) throw optionsError
        }
      }
    }

    return this.get(id)
  },

  /** Remove um produto (requer autenticação + RLS). */
  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return true
  },

  /** Faz upload de imagem comprimida (WebP) para o bucket público `product-images`. */
  async uploadImage(file, productId) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const compressed = await compressImage(file)
    const fileName = `${productId}/${Date.now()}.webp`
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, compressed, { contentType: 'image/webp' })
    if (error) throw error
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return urlData.publicUrl
  },

  /** Faz upload de múltiplas imagens comprimidas para o bucket público `product-images`. */
  async uploadImages(files, productId) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const urls = []
    for (const file of files) {
      const url = await productService.uploadImage(file, productId)
      urls.push(url)
    }
    return urls
  },

  /** Remove imagem do bucket pelo nome do arquivo. */
  async removeImage(fileName) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.storage.from('product-images').remove([fileName])
    if (error) throw error
    return true
  },
}

export { formatPrice }
