/**
 * Catalogo de Produtos - Dona Cá Doceria - Confeitaria Artesanal
 * Foco: Bolos Festivos, Doces Finos, Sobremesas, Pronta Entrega
 * ============================================================
 * COMO ADICIONAR/EDITAR PRODUTOS:
 * - Copie um objeto existente e altere os campos
 * - imageUrl: Use URL PUBLICA do Supabase Storage (ex.: 'https://xyz.supabase.co/storage/v1/object/public/bucket/bolo-001.jpg')
 *           Ou caminho local em /public/images/ (ex.: '/images/bolos/bolo-001.jpg')
 *           Deixe string vazia '' para usar placeholder automatico
 * - flavors:   Array de sabores disponiveis para o produto
 * - yields:    Array de rendimentos/tamanhos (ex.: ['Fatia Individual', '10 a 12 fatias', '20 a 22 fatias', 'Caixa com 25 un.', 'Cento (100 un.)'])
 * - price:     Numero sem formatacao (ex.: 159.9) - a formatacao R$ e automatica
 * - id:        Identificador unico curto (ex.: 'bolo-001', 'brig-001', 'sobe-001')
 * - category:  Uma das categorias validas: 'Pronta Entrega', 'Bolos Festivos', 'Doces Finos', 'Sobremesas no Pote', 'Kits Festa'
 * - availabilityType: 'ready' (Pronta Entrega) | 'order' (Sob Encomenda) | 'paused' (Esgotado)
 * - minAdvanceHours: Horas de antecedencia minima (0, 24, 48, 72)
 * - isFeatured: true para destaque na home
 * - optionGroups: Grupos de personalizacao (ex: Massa, Recheios, Coberturas, Adicionais)
 * - isNew:     true para selo 'Novo', false para nao mostrar
 * - available: false para mostrar 'Esgotado / Indisponível', true para normal
 */

export const BRAND_COLORS = {
  CHOCOLATE: { name: 'Chocolate 50%', hex: '#7A4426' },
  BAUNILHA: { name: 'Baunilha', hex: '#FDF9F9' },
  RED_VELVET: { name: 'Red Velvet', hex: '#C46D7C' },
  CENOURA: { name: 'Cenoura', hex: '#F29CAB' },
  PISTACHE: { name: 'Pistache', hex: '#7A4426' },
  MORANGO: { name: 'Morango', hex: '#C46D7C' },
  DOCE_LEITE: { name: 'Doce de Leite', hex: '#F29CAB' },
  NOZES: { name: 'Nozes', hex: '#7A4426' },
}

/**
 * Rendimentos/padrao de confeitaria — rotulos curtos para botoes de selecao
 */
export const BRAND_YIELDS = {
  FATIA: 'Fatia Individual',
  REND_10_12: '10 a 12 fatias',
  REND_20_22: '20 a 22 fatias',
  REND_30_35: '30 a 35 fatias',
  CAIXA_25: 'Caixa com 25 un.',
  CENTO_100: 'Cento (100 un.)',
}

/**
 * Descricao amigável para cada rendimento (guia na vitrine)
 */
export const YIELD_INFO = {
  'Fatia Individual': 'Fatia individual (aprox. 150g)',
  '10 a 12 fatias': 'Bolo P (15cm - 10 a 12 fatias)',
  '20 a 22 fatias': 'Bolo M (20cm - 20 a 22 fatias)',
  '30 a 35 fatias': 'Bolo G (25cm - 30 a 35 fatias)',
  'Caixa com 25 un.': 'Caixa com 25 unidades',
  'Cento (100 un.)': 'Cento com 100 unidades',
}

/**
 * Grupos de opcao padrao para produtos de confeitaria (estrutura de fallback estatico).
 * Cada produto pode definir seus próprios optionGroups; esta e apenas uma referencia.
 */
export const DEFAULT_OPTION_GROUPS = [
  {
    title: 'Rendimento em Fatias',
    type: 'single',
    required: true,
    minChoices: 1,
    maxChoices: 1,
    displayOrder: 0,
    options: [
      { name: 'Fatia Individual', priceDelta: 0, available: true, displayOrder: 0 },
      { name: '10 a 12 fatias', priceDelta: 0, available: true, displayOrder: 1 },
      { name: '20 a 22 fatias', priceDelta: 0, available: true, displayOrder: 2 },
      { name: '30 a 35 fatias', priceDelta: 0, available: true, displayOrder: 3 },
    ],
  },
  {
    title: 'Massa',
    type: 'single',
    required: false,
    minChoices: 0,
    maxChoices: 1,
    displayOrder: 1,
    options: [
      { name: 'Chocolate 50%', priceDelta: 0, available: true, displayOrder: 0 },
      { name: 'Baunilha', priceDelta: 0, available: true, displayOrder: 1 },
      { name: 'Red Velvet', priceDelta: 5, available: true, displayOrder: 2 },
      { name: 'Cenoura', priceDelta: 0, available: true, displayOrder: 3 },
    ],
  },
  {
    title: 'Recheios',
    type: 'multiple',
    required: false,
    minChoices: 0,
    maxChoices: 2,
    displayOrder: 2,
    options: [
      { name: 'Brigadeiro Belga', priceDelta: 3, available: true, displayOrder: 0 },
      { name: 'Doce de Leite', priceDelta: 2, available: true, displayOrder: 1 },
      { name: 'Morango Fresco', priceDelta: 4, available: true, displayOrder: 2 },
      { name: 'Pistache', priceDelta: 6, available: true, displayOrder: 3 },
    ],
  },
  {
    title: 'Adicionais',
    type: 'multiple',
    required: false,
    minChoices: 0,
    maxChoices: 5,
    displayOrder: 3,
    options: [
      { name: 'Morangos extras', priceDelta: 5, available: true, displayOrder: 0 },
      { name: 'Caixinha para presente', priceDelta: 8, available: true, displayOrder: 1 },
      { name: 'Topo personalizado', priceDelta: 15, available: true, displayOrder: 2 },
    ],
  },
]

/**
 * Base de dados inicial - produtos de confeitaria cobrindo as categorias.
 * SUBSTITUA imageUrl POR URLS REAIS DO SUPABASE STORAGE QUANDO DISPONÍVEIS.
 */
export const products = [
  // PRONTA ENTREGA
  {
    id: 'bolo-001',
    name: 'Bolo Festivo de Chocolate',
    description: 'Bolo de camadas de chocolate 50% com recheio de brigadeiro belga e cobertura de ganache. Ideal para celebrações.',
    price: 189.9,
    basePrice: 189.9,
    flavors: [BRAND_COLORS.CHOCOLATE, BRAND_COLORS.DOCE_LEITE],
    yields: [BRAND_YIELDS.FATIA, BRAND_YIELDS.REND_10_12, BRAND_YIELDS.REND_20_22, BRAND_YIELDS.REND_30_35],
    imageUrl: '',
    category: 'Pronta Entrega',
    categoryId: null,
    availabilityType: 'ready',
    minAdvanceHours: 0,
    isFeatured: true,
    isNew: true,
    available: true,
    optionGroups: [
      {
        title: 'Rendimento em Fatias',
        type: 'single',
        required: true,
        minChoices: 1,
        maxChoices: 1,
        displayOrder: 0,
        options: [
          { name: 'Fatia Individual', priceDelta: 0, available: true, displayOrder: 0 },
          { name: '10 a 12 fatias', priceDelta: 0, available: true, displayOrder: 1 },
          { name: '20 a 22 fatias', priceDelta: 45, available: true, displayOrder: 2 },
          { name: '30 a 35 fatias', priceDelta: 80, available: true, displayOrder: 3 },
        ],
      },
      {
        title: 'Adicionais',
        type: 'multiple',
        required: false,
        minChoices: 0,
        maxChoices: 5,
        displayOrder: 1,
        options: [
          { name: 'Morangos extras', priceDelta: 5, available: true, displayOrder: 0 },
          { name: 'Caixinha para presente', priceDelta: 8, available: true, displayOrder: 1 },
          { name: 'Topo personalizado', priceDelta: 15, available: true, displayOrder: 2 },
        ],
      },
    ],
  },
  {
    id: 'brig-001',
    name: 'Caixa de Brigadeiros Gourmet',
    description: 'Caixa com 12 brigadeiros gourmet em sabores variados: tradicional, pistache, morango e doce de leite.',
    price: 48.9,
    basePrice: 48.9,
    flavors: [BRAND_COLORS.CHOCOLATE, BRAND_COLORS.PISTACHE, BRAND_COLORS.MORANGO, BRAND_COLORS.DOCE_LEITE],
    yields: [BRAND_YIELDS.CAIXA_25],
    imageUrl: '',
    category: 'Doces Finos',
    categoryId: null,
    availabilityType: 'ready',
    minAdvanceHours: 24,
    isFeatured: true,
    isNew: false,
    available: true,
    optionGroups: [
      {
        title: 'Rendimento em Fatias',
        type: 'single',
        required: true,
        minChoices: 1,
        maxChoices: 1,
        displayOrder: 0,
        options: [
          { name: 'Caixa com 25 un.', priceDelta: 0, available: true, displayOrder: 0 },
          { name: 'Cento (100 un.)', priceDelta: 90, available: true, displayOrder: 1 },
        ],
      },
    ],
  },
  {
    id: 'sobe-001',
    name: 'Sobremesa na Travessa',
    description: 'Sobremesa de colher em camadas de mousse de maracujá, biscoito maisena e chantilly. Serve 6 a 8 pessoas.',
    price: 65.9,
    basePrice: 65.9,
    flavors: [BRAND_COLORS.BAUNILHA],
    yields: [BRAND_YIELDS.FATIA],
    imageUrl: '',
    category: 'Sobremesas no Pote',
    categoryId: null,
    availabilityType: 'ready',
    minAdvanceHours: 0,
    isFeatured: false,
    isNew: true,
    available: true,
    optionGroups: [],
  },
  // BOLOS FESTIVOS
  {
    id: 'bolo-002',
    name: 'Bolo Red Velvet',
    description: 'Bolo Red Velvet com cobertura de cream cheese e lascas de chocolate branco. Um clássico sofisticado.',
    price: 219.9,
    basePrice: 219.9,
    flavors: [BRAND_COLORS.RED_VELVET],
    yields: [BRAND_YIELDS.REND_10_12, BRAND_YIELDS.REND_20_22],
    imageUrl: '',
    category: 'Bolos Festivos',
    categoryId: null,
    availabilityType: 'order',
    minAdvanceHours: 48,
    isFeatured: true,
    isNew: false,
    available: true,
    optionGroups: [
      {
        title: 'Rendimento em Fatias',
        type: 'single',
        required: true,
        minChoices: 1,
        maxChoices: 1,
        displayOrder: 0,
        options: [
          { name: '10 a 12 fatias', priceDelta: 0, available: true, displayOrder: 0 },
          { name: '20 a 22 fatias', priceDelta: 55, available: true, displayOrder: 1 },
        ],
      },
      {
        title: 'Massa',
        type: 'single',
        required: false,
        minChoices: 0,
        maxChoices: 1,
        displayOrder: 1,
        options: [
          { name: 'Red Velvet', priceDelta: 0, available: true, displayOrder: 0 },
          { name: 'Chocolate 50%', priceDelta: 0, available: true, displayOrder: 1 },
        ],
      },
    ],
  },
  {
    id: 'bolo-003',
    name: 'Bolo de Cenoura com Cobertura',
    description: 'Bolo de cenoura fofinho com cobertura generosa de chocolate ao leite. O sabor da infância em versão artesanal.',
    price: 159.9,
    basePrice: 159.9,
    flavors: [BRAND_COLORS.CENOURA, BRAND_COLORS.CHOCOLATE],
    yields: [BRAND_YIELDS.REND_10_12, BRAND_YIELDS.REND_20_22, BRAND_YIELDS.REND_30_35],
    imageUrl: '',
    category: 'Bolos Festivos',
    categoryId: null,
    availabilityType: 'ready',
    minAdvanceHours: 24,
    isFeatured: false,
    isNew: true,
    available: true,
    optionGroups: [
      {
        title: 'Rendimento em Fatias',
        type: 'single',
        required: true,
        minChoices: 1,
        maxChoices: 1,
        displayOrder: 0,
        options: [
          { name: '10 a 12 fatias', priceDelta: 0, available: true, displayOrder: 0 },
          { name: '20 a 22 fatias', priceDelta: 40, available: true, displayOrder: 1 },
          { name: '30 a 35 fatias', priceDelta: 75, available: true, displayOrder: 2 },
        ],
      },
    ],
  },
  // DOCES FINOS
  {
    id: 'brig-002',
    name: 'Brigadeiro de Pistache',
    description: 'Brigadeiro gourmet de pistache com cobertura de chocolate branco e granulação de pistache.',
    price: 8.9,
    basePrice: 8.9,
    flavors: [BRAND_COLORS.PISTACHE],
    yields: [BRAND_YIELDS.FATIA],
    imageUrl: '',
    category: 'Doces Finos',
    categoryId: null,
    availabilityType: 'ready',
    minAdvanceHours: 24,
    isFeatured: false,
    isNew: false,
    available: true,
    optionGroups: [],
  },
  {
    id: 'doc-001',
    name: 'Beijinho de Coco',
    description: 'Beijinho tradicional de coco com geleia de maracujá e noz-da-índia.',
    price: 6.9,
    basePrice: 6.9,
    flavors: [BRAND_COLORS.BAUNILHA],
    yields: [BRAND_YIELDS.FATIA],
    imageUrl: '',
    category: 'Doces Finos',
    categoryId: null,
    availabilityType: 'ready',
    minAdvanceHours: 24,
    isFeatured: false,
    isNew: false,
    available: true,
    optionGroups: [],
  },
  // SOBREMESAS
  {
    id: 'sobe-002',
    name: 'Pavê de Morango',
    description: 'Pavê de morango com creme de baunilha, biscoito champagne e morangos frescos. Serve 8 a 10 pessoas.',
    price: 89.9,
    basePrice: 89.9,
    flavors: [BRAND_COLORS.MORANGO, BRAND_COLORS.BAUNILHA],
    yields: [BRAND_YIELDS.FATIA],
    imageUrl: '',
    category: 'Sobremesas no Pote',
    categoryId: null,
    availabilityType: 'order',
    minAdvanceHours: 48,
    isFeatured: false,
    isNew: true,
    available: true,
    optionGroups: [],
  },
]

export const categories = [
  { id: 'Todas', name: 'Todas', active: true },
  { id: 'Pronta Entrega', name: 'Pronta Entrega', active: true },
  { id: 'Bolos Festivos', name: 'Bolos Festivos', active: true },
  { id: 'Doces Finos', name: 'Doces Finos', active: true },
  { id: 'Sobremesas no Pote', name: 'Sobremesas no Pote', active: true },
  { id: 'Kits Festa', name: 'Kits Festa', active: true },
]

/**
 * Formata um valor numerico para moeda BRL (pt-BR).
 * @param {number} price - Preco em reais (ex.: 159.9)
 * @returns {string} Valor formatado (ex.: "R$ 159,90")
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

/**
 * Retorna produtos filtrados por categoria.
 * @param {string} categoryId - ID da categoria (ex.: "Bolos Festivos")
 * @param {Product[]} [productList=products] - Lista base de produtos
 * @returns {Product[]}
 */
export function getProductsByCategory(categoryId, productList = products) {
  return productList.filter(p => p.category === categoryId)
}

/**
 * Retorna produtos marcados como novidade.
 * @param {Product[]} [productList=products] - Lista base de produtos
 * @returns {Product[]}
 */
export function getNewProducts(productList = products) {
  return productList.filter(p => p.isNew)
}

/**
 * Retorna apenas produtos disponíveis para venda.
 * @param {Product[]} [productList=products] - Lista base de produtos
 * @returns {Product[]}
 */
export function getAvailableProducts(productList = products) {
  return productList.filter(p => p.available)
}

/**
 * Busca um produto pelo ID.
 * @param {string} id - ID do produto (ex.: "bolo-001")
 * @param {Product[]} [productList=products] - Lista base de produtos
 * @returns {Product | undefined}
 */
export function getProductById(id, productList = products) {
  return productList.find(p => p.id === id)
}