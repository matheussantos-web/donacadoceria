/**
 * src/data/catalogo.js
 * Configurações centralizadas da loja Dona Ca Doceria.
 * Edite aqui para alterar produtos, preços, WhatsApp e textos institucionais
 * sem tocar nos componentes visuais.
 */

export const LOJA = {
  nome: 'Dona Ca Doceria',
  slogan: 'Doces que encantam',
  selo: 'Feito com carinho',
  whatsapp: '5511999999999', // número com DDI, sem '+'
  instagram: '@donacadoceria',
  endereco: 'Atelier de Confeitaria Artesanal - São Paulo/SP',
  horario: 'Ter a Sáb, 9h às 18h',
}

/**
 * Regras institucionais de encomendas e pagamento.
 */
export const REGRAS = {
  antecedenciaMinimaDias: 5,
  entradaPercentual: 50,
  formasPagamento: ['Pix', 'Dinheiro', 'Cartão'],
  instrucoes: [
    'Nossos bolos têm 10 cm de altura, com 2 camadas de recheio e 3 discos de massa.',
    'O número de fatias pode variar de acordo com a espessura que for cortada.',
    'Não nos responsabilizamos por acidentes depois da entrega do bolo.',
    'Em caso de desistência da encomenda 24 horas antes da entrega, não haverá devolução do valor de 50% pago.',
  ],
}

/**
 * Tamanhos de bolo (sem usar Kg, apenas letras).
 */
export const TAMANHOS = [
  { chave: 'P', label: 'P', serve: 'até 8 pessoas', precoMultiplicador: 1.0 },
  { chave: 'M', label: 'M', serve: 'até 15 pessoas', precoMultiplicador: 1.4 },
  { chave: 'G', label: 'G', serve: 'até 25 pessoas', precoMultiplicador: 1.9 },
  { chave: 'GG', label: 'GG', serve: 'até 40 pessoas', precoMultiplicador: 2.6 },
]

export const LINHAS = [
  { chave: 'tradicional', label: 'Linha Tradicional', descricao: 'Sabor clássico da casa', cor: 'brand-rose' },
  { chave: 'premium', label: 'Linha Premium', descricao: 'Ingredientes nobres e decoração especial', cor: 'brand-berry' },
]

export const MASSAS = [
  { chave: 'baunilha', label: 'Branca / Baunilha', precoAdicional: 0 },
  { chave: 'chocolate', label: 'Chocolate', precoAdicional: 0 },
  { chave: 'redvelvet', label: 'Red Velvet', precoAdicional: 0 },
]

export const RECHEIOS = [
  { chave: 'chocolate', label: 'Chocolate' },
  { chave: 'morango', label: 'Morango' },
  { chave: 'maracuja', label: 'Maracujá' },
  { chave: 'doce_leite', label: 'Doce de Leite' },
  { chave: 'ninho', label: 'Ninho' },
  { chave: 'prestigio', label: 'Prestígio' },
]

export const COBERTURAS = [
  { chave: 'chantininho', label: 'Chantininho liso', precoAdicional: 0 },
  { chave: 'espatulado', label: 'Espatulado', precoAdicional: 15 },
  { chave: 'ganache', label: 'Ganache', precoAdicional: 20 },
]

/**
 * Array principal de produtos do cardápio.
 * tipo: 'pronta-entrega' | 'encomenda'
 */
export const PRODUTOS = [
  // --- Pronta Entrega ---
  {
    id: 'sacole-paçoca',
    nome: 'Sacolé Cremoso - Paçoca',
    tipo: 'pronta-entrega',
    descricao: 'Sacolé cremoso 100ml em saquinho 4x24.',
    preco: 4.00,
    imagem: 'https://images.unsplash.com/photo-1603436572270-3745591285a1?w=400&q=80',
    tags: ['Doces do Dia'],
    combo: { quantidade: 3, preco: 10.00 },
    sabores: ['Paçoca', 'Maracujá Cremoso', 'Coco Cremoso', 'Morango com Casquinha de Chocolate', 'Ninho com Geleia de Morango'],
  },
  {
    id: 'sacole-maracuja',
    nome: 'Sacolé Cremoso - Maracujá Cremoso',
    tipo: 'pronta-entrega',
    descricao: 'Sacolé cremoso 100ml em saquinho 4x24.',
    preco: 4.00,
    imagem: 'https://images.unsplash.com/photo-1591706835022-3e2c4e71c6e1?w=400&q=80',
    tags: ['Doces do Dia'],
    combo: { quantidade: 3, preco: 10.00 },
    sabores: ['Paçoca', 'Maracujá Cremoso', 'Coco Cremoso', 'Morango com Casquinha de Chocolate', 'Ninho com Geleia de Morango'],
  },
  {
    id: 'sacole-coco',
    nome: 'Sacolé Cremoso - Coco Cremoso',
    tipo: 'pronta-entrega',
    descricao: 'Sacolé cremoso 100ml em saquinho 4x24.',
    preco: 4.00,
    imagem: 'https://images.unsplash.com/photo-1539737818731-1e08962ba719?w=400&q=80',
    tags: ['Doces do Dia'],
    combo: { quantidade: 3, preco: 10.00 },
    sabores: ['Paçoca', 'Maracujá Cremoso', 'Coco Cremoso', 'Morango com Casquinha de Chocolate', 'Ninho com Geleia de Morango'],
  },
  {
    id: 'copo-felicidade',
    nome: 'Copo da Felicidade',
    tipo: 'pronta-entrega',
    descricao: 'Camadas de cremes artesanais, brownie/bolo e frutas ou chocolates.',
    preco: 12.00,
    imagem: 'https://images.unsplash.com/photo-1558961237-cd2b96d40a9d?w=400&q=80',
    tags: ['Doces do Dia'],
  },
  {
    id: 'bolo-pote',
    nome: 'Bolo de Pote',
    tipo: 'pronta-entrega',
    descricao: 'Massas úmidas com recheios cremosos individuais.',
    preco: 10.00,
    imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
    tags: ['Doces do Dia'],
  },
  {
    id: 'brownie',
    nome: 'Brownie',
    tipo: 'pronta-entrega',
    descricao: 'Tradicional, recheado ou com cobertura.',
    preco: 8.00,
    imagem: 'https://images.unsplash.com/photo-1606313564200-e75d5e33076f?w=400&q=80',
    tags: ['Doces do Dia'],
  },

  // --- Encomenda Linha Tradicional ---
  {
    id: 'bolo-tradicional-p',
    nome: 'Bolo Festivo Tradicional',
    tipo: 'encomenda',
    linha: 'tradicional',
    descricao: 'Bolo festivo sob encomenda. 10 cm de altura, 3 discos de massa e 2 camadas de recheio.',
    precoBase: 80.00,
    imagem: 'https://images.unsplash.com/photo-1563927757781-93672a6707d4?w=400&q=80',
    tags: ['Encomenda • Linha Tradicional'],
  },
  {
    id: 'bolo-premium-p',
    nome: 'Bolo Festivo Premium',
    tipo: 'encomenda',
    linha: 'premium',
    descricao: 'Bolo festivo com ingredientes nobres e decoração especial.',
    precoBase: 120.00,
    imagem: 'https://images.unsplash.com/photo-1573825539949-5c63b487f3e5?w=400&q=80',
    tags: ['Encomenda • Linha Premium'],
  },
]

/**
 * Filtros rápidos do cardápio.
 */
export const FILTROS = [
  { chave: 'todos', label: 'Todos' },
  { chave: 'pronta-entrega', label: 'Pronta Entrega' },
  { chave: 'encomenda-tradicional', label: 'Encomenda • Linha Tradicional' },
  { chave: 'encomenda-premium', label: 'Encomenda • Linha Premium' },
]
