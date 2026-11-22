/**
 * Configuração central da loja Dona Ca Doceria — Confeitaria Artesanal
 * ============================================================
 * EDITE ESTE ARQUIVO PARA CONFIGURAR A LOJA SEM TOCAR NO CÓDIGO DOS COMPONENTES.
 *
 * COMO PREENCHER:
 * - whatsappNumber: Use APENAS dígitos, formato internacional (ex.: "5521999999999")
 *                   Deixe string vazia "" para desabilitar botões de WhatsApp
 * - instagramUrl:   URL completa do perfil (ex.: "https://www.instagram.com/usuario/")
 * - contactEmail:   E-mail para contato (ex.: "contato@donacadoceria.com.br")
 */

export const storeConfig = {
  /** Nome exibido da loja/marca (não altere a menos que a marca mude) */
  storeName: 'Dona Ca Doceria — Confeitaria Artesanal',

  /** Número do WhatsApp no formato APENAS DÍGITOS (código país + DDD + número)
   *  Exemplo BR: "5521999999999" (55=Brasil, 21=DDD RJ, 999999999=celular)
   *  Deixe vazio "" para desabilitar botões de WhatsApp até configurar. */
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '',

  /** Texto padrão da saudação no WhatsApp (opcional) */
  whatsappDefaultMessage:
    import.meta.env.VITE_WHATSAPP_DEFAULT_MESSAGE ||
    'Olá! Gostaria de saber mais sobre os doces e bolos da Dona Ca Doceria.',

  /** Link do Instagram (opcional) - URL completa com https:// */
  instagramUrl: import.meta.env.VITE_INSTAGRAM_URL || '',

  /** Email de contato (opcional) */
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || '',

  /** Moeda e locale para formatação de preços (não altere) */
  currency: 'BRL',
  locale: 'pt-BR',
}

/**
 * Gera o link completo do WhatsApp com a mensagem codificada.
 * @param {string} [customMessage] - Mensagem personalizada (opcional)
 * @returns {string} URL do WhatsApp pronta para uso
 */
export function getWhatsAppUrl(customMessage = '') {
  const message = customMessage || storeConfig.whatsappDefaultMessage
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${storeConfig.whatsappNumber}?text=${encodedMessage}`
}

/**
 * Verifica se o WhatsApp está configurado e disponível.
 * @returns {boolean}
 */
export function isWhatsAppConfigured() {
  return Boolean(storeConfig.whatsappNumber && storeConfig.whatsappNumber.trim().length > 0)
}

export default storeConfig