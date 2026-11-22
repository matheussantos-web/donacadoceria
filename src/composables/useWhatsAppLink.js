/**
 * Composable para geração de links WhatsApp com mensagens pré-preenchidas.
 * Centraliza a lógica de normalização de número, montagem de mensagem e geração de URL.
 */

import { storeConfig, isWhatsAppConfigured, getWhatsAppUrl as getStoreWhatsAppUrl } from '@/config/store'
import { formatPrice } from '@/data/products'

/**
 * Normaliza um número de telefone para o formato internacional apenas dígitos.
 * Remove parênteses, traços, espaços, "+" e mantém apenas números.
 * @param {string} raw - Número bruto (ex.: "(21) 99999-9999", "55 21 99999-9999", "+552****9999")
 * @returns {string} Apenas dígitos (ex.: "5521999999999")
 */
export function normalizePhoneNumber(raw) {
  if (!raw) return ''
  return raw.replace(/\D/g, '')
}

/**
 * Valida se um número normalizado tem dígitos suficientes para ser um número brasileiro válido.
 * Mínimo: 10 dígitos (DDD + 8 dígitos antigo) ou 11 dígitos (DDD + 9 dígitos atual) + código do país (2 dígitos = 55).
 * Aceitamos >= 10 dígitos para ser permissivo.
 * @param {string} normalized - Número já normalizado (apenas dígitos)
 * @returns {boolean}
 */
export function isValidPhoneNumber(normalized) {
  return normalized.length >= 10
}

/**
 * Verifica se uma URL é uma URL externa válida (http/https).
 * Útil para decidir se incluímos o link da foto na mensagem.
 * @param {string} url - URL a verificar
 * @returns {boolean}
 */
export function isValidExternalUrl(url) {
  if (!url || typeof url !== 'string') return false
  return /^https?:\/\//i.test(url.trim())
}

/**
 * Gera a mensagem padrão de compra para um produto.
 * Tom acolhedor, artesanal e natural para confeitaria.
 * Inclui referência do item, tamanho/peso, valor e link da foto (quando URL externa válida).
 * Sabores não são listados na mensagem; a conversa sobre sabores é tratada diretamente no WhatsApp.
 * @param {Object} product - Objeto do produto (name, price, imageUrl, id, etc.)
 * @param {Object|null} selectedColor - Mantido para compatibilidade; não é usado na mensagem
 * @param {string|null} selectedSize - Tamanho selecionado (string) ou null
 * @returns {string} Mensagem formatada em pt-BR
 */
export function buildPurchaseMessage(product, selectedColor = null, selectedSize = null) {
  const price = formatPrice(product.price)

  // Código curto do item (6 primeiros caracteres do id)
  const shortCode = product.id ? String(product.id).slice(0, 6) : ''

  // Foto de capa (imageUrl ou primeira de images)
  const coverImage = product.imageUrl || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '')

  // Link curto de foto do próprio domínio (ex.: https://dominio.com/f/abcdef)
  const shortPhotoUrl =
    shortCode && coverImage && typeof window !== 'undefined'
      ? `${window.location.origin}/f/${shortCode.toLowerCase()}`
      : ''

  // Tamanho selecionado
  const sizeInfo = selectedSize ? `Tamanho: ${selectedSize}` : ''

  const lines = [
    'Oi, Dona Ca! Tudo bem?',
    '',
    'Gostaria de saber se este item ainda está disponível e quais sabores vocês têm:',
    '',
  ]

  const modeloLine = shortCode ? `*Item:* ${product.name} (#${shortCode.toUpperCase()})` : `*Item:* ${product.name}`
  lines.push(`- ${modeloLine}`)

  if (sizeInfo) {
    lines.push(`- *${sizeInfo}*`)
  }

  lines.push(`- *Valor:* ${price}`, '')

  // Link curto de foto isolado na última linha para prévia do WhatsApp
  if (shortPhotoUrl) {
    lines.push(shortPhotoUrl.trim())
  }

  return lines.join('\n')
}

/**
 * Gera a URL completa do WhatsApp para compra de um produto.
 * @param {Object} product - Objeto do produto
 * @param {Object|null} selectedColor - Cor selecionada (não utilizado, mantido para compatibilidade)
 * @param {string|null} selectedSize - Tamanho selecionado
 * @returns {string|null} URL do WhatsApp ou null se não configurado
 */
export function getWhatsAppPurchaseUrl(product, selectedColor = null, selectedSize = null) {
  if (!isWhatsAppConfigured()) return null

  const message = buildPurchaseMessage(product, selectedColor, selectedSize)
  return getStoreWhatsAppUrl(message)
}

/**
 * Abre o WhatsApp em nova aba com a mensagem de compra.
 * Trata o caso de número não configurado de forma segura.
 * @param {Object} product - Objeto do produto
 * @param {Object|null} selectedColor - Cor selecionada (não utilizado, mantido para compatibilidade)
 * @param {string|null} selectedSize - Tamanho selecionado
 * @returns {boolean} true se abriu, false se número não configurado
 */
export function openWhatsAppPurchase(product, selectedColor = null, selectedSize = null) {
  const url = getWhatsAppPurchaseUrl(product, selectedColor, selectedSize)

  if (!url) {
    console.warn('[WhatsApp] Número não configurado em src/config/store.js')
    return false
  }

  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

/**
 * Retorna estado reativo/indicador de configuração do WhatsApp.
 * Útil para desabilitar botões ou mostrar avisos na UI.
 */
export function useWhatsAppStatus() {
  return {
    isConfigured: isWhatsAppConfigured(),
    number: storeConfig.whatsappNumber,
    normalizedNumber: normalizePhoneNumber(storeConfig.whatsappNumber),
  }
}

export default {
  normalizePhoneNumber,
  isValidPhoneNumber,
  isValidExternalUrl,
  buildPurchaseMessage,
  getWhatsAppPurchaseUrl,
  openWhatsAppPurchase,
  useWhatsAppStatus,
}