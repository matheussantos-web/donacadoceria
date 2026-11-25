/**
 * src/config/cakeBuilderConfig.js
 * Configuração centralizada de sabores, cores e escalas do montador de bolos da Dona Ca Doceria.
 * Edite aqui para alterar massas, recheios, coberturas e escalas sem tocar nos componentes visuais.
 */

export const CAKE_SIZE_SCALES = {
  P: 0.85,
  M: 1.0,
  G: 1.14,
  GG: 1.26,
}

/**
 * Massas disponíveis para o montador de bolos.
 * id: chave interna | name: nome exibido | color: cor hexadecimal | lines: linhas que permitem esta massa
 */
export const CAKE_BATTERS = [
  { id: 'baunilha', name: 'Baunilha', color: '#F2D29B', lines: ['tradicional', 'premium'] },
  { id: 'chocolate', name: 'Chocolate', color: '#5A382C', lines: ['tradicional', 'premium'] },
  { id: 'redvelvet', name: 'Red Velvet', color: '#9E2A3B', lines: ['tradicional', 'premium'] },
]

/**
 * Recheios disponíveis para o montador de bolos.
 * id: chave interna | name: nome exibido | color: cor hexadecimal | lines: linhas que permitem este recheio
 */
export const CAKE_FILLINGS = [
  { id: 'brigadeiro', name: 'Brigadeiro', color: '#3E2218', lines: ['tradicional', 'premium'] },
  { id: 'ninho', name: 'Ninho', color: '#FFF5E1', lines: ['tradicional', 'premium'] },
  { id: 'morango', name: 'Morango / Geleia', color: '#C83E59', lines: ['tradicional', 'premium'] },
  { id: 'maracuja', name: 'Maracujá', color: '#F2B830', lines: ['tradicional', 'premium'] },
  { id: 'doce_leite', name: 'Doce de Leite', color: '#C47E3E', lines: ['tradicional', 'premium'] },
  { id: 'pistache', name: 'Pistache', color: '#8FA85B', lines: ['premium'] },
]

/**
 * Coberturas disponíveis para o montador de bolos.
 * id: chave interna | name: nome exibido | color: cor hexadecimal | style: 'smooth' ou 'naked' | dripColor: cor da calda/derivação
 */
export const CAKE_FROSTINGS = [
  { id: 'chantininho', name: 'Chantininho Creme', color: '#F8F0E9', style: 'smooth', dripColor: '#C98291' },
  { id: 'chantininho_rose', name: 'Chantininho Rosé', color: '#C98291', style: 'smooth', dripColor: '#8E5365' },
  { id: 'berry', name: 'Berry', color: '#8E5365', style: 'smooth', dripColor: '#8E5365' },
  { id: 'ganache', name: 'Ganache Cacau', color: '#543227', style: 'smooth', dripColor: '#543227' },
  { id: 'naked', name: 'Naked Cake', color: '#FFF8F0', style: 'naked', dripColor: '#C98291' },
]

/**
 * Resolve a cor hexadecimal de um item buscando primeiro nas listas configuradas
 * (CAKE_BATTERS, CAKE_FILLINGS, CAKE_FROSTINGS) pelo nome (case-insensitive).
 * Se não encontrar, retorna o fallbackHex fornecido.
 */
export function resolveColorByName(name, fallbackHex) {
  if (!name) return fallbackHex
  const normalized = String(name).toLowerCase().trim()
  const lists = [CAKE_BATTERS, CAKE_FILLINGS, CAKE_FROSTINGS]
  for (const list of lists) {
    const found = list.find((item) => String(item.name || '').toLowerCase().trim() === normalized)
    if (found) return found.color
  }
  return fallbackHex
}
