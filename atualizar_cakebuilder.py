p = 'src/views/CakeBuilder.vue'
s = open(p, encoding='utf-8').read()

# Substituir import de produtos para incluir cakeBuilderConfig
antigo_import = """import {
  TAMANHOS, LINHAS, MASSAS, RECHEIOS, COBERTURAS, REGRAS,
} from '@/data/products'"""

novo_import = """import {
  TAMANHOS, LINHAS, MASSAS, RECHEIOS, COBERTURAS, REGRAS,
} from '@/data/products'
import {
  CAKE_BATTERS,
  CAKE_FILLINGS,
  CAKE_FROSTINGS,
  resolveColorByName,
} from '@/config/cakeBuilderConfig'"""

assert antigo_import in s, 'import não encontrado'
s = s.replace(antigo_import, novo_import)

# Substituir BATTERS_MAP por CAKE_BATTERS
antigo_batters = """const BATTERS_MAP = {
  baunilha: { name: 'Baunilha', color: '#F3DFC1' },
  chocolate: { name: 'Chocolate', color: '#4E3229' },
  redvelvet: { name: 'Red Velvet', color: '#8E354A'},
}"""
assert antigo_batters in s, 'BATTERS_MAP não encontrado'
s = s.replace(antigo_batters, '')

# Substituir FROSTINGS_MAP por CAKE_FROSTINGS
antigo_frostings = """const FROSTINGS_MAP = {
  chantininho: { name: 'Chantininho Creme', color: '#F8F0E9', style: 'smooth' },
  chantininho_rose: { name: 'Chantininho Rosé', color: '#C98291', style: 'smooth' },
  berry: { name: 'Berry', color: '#8E5365', style: 'smooth' },
  ganache: { name: 'Ganache Cacau', color: '#4A2E2B', style: 'drip' },
  naked: { name: 'Naked Cake', color: '#FFFFFF', style: 'naked' },
}"""
assert antigo_frostings in s, 'FROSTINGS_MAP não encontrado'
s = s.replace(antigo_frostings, '')

# Substituir RECHEIOS_MAP por CAKE_FILLINGS
antigo_recheios = """const RECHEIOS_MAP = {
  brigadeiro: { name: 'Brigadeiro', color: '#3B231C' },
  ninho: { name: 'Ninho', color: '#FFF8EB' },
  morango: { name: 'Morango', color: '#C95B72' },
  doce_leite: { name: 'Doce de Leite', color: '#C68B59' },
  maracuja: { name: 'Maracujá', color: '#E8B948' },
  pistache: { name: 'Pistache', color: '#7A4426' },
}"""
assert antigo_recheios in s, 'RECHEIOS_MAP não encontrado'
s = s.replace(antigo_recheios, '')

# Atualizar batterSelecionado para usar CAKE_BATTERS + resolveColorByName
antigo_batter_comp = """const batterSelecionado = computed(() => BATTERS_MAP[massaSelecionada.value] || BATTERS_MAP.baunilha)"""
assert antigo_batter_comp in s, 'batterSelecionado não encontrado'
s = s.replace(
    antigo_batter_comp,
    """const batterSelecionado = computed(() => {
  const m = CAKE_BATTERS.find((b) => b.id === massaSelecionada.value) || CAKE_BATTERS[0]
  return { name: m.name, color: m.color }
})"""
)

# Atualizar frostingSelecionado para usar CAKE_FROSTINGS
antigo_frosting_comp = """const frostingSelecionado = computed(() => FROSTINGS_MAP[coberturaSelecionada.value] || FROSTINGS_MAP.chantininho)"""
assert antigo_frosting_comp in s, 'frostingSelecionado não encontrado'
s = s.replace(
    antigo_frosting_comp,
    """const frostingSelecionado = computed(() => {
  const f = CAKE_FROSTINGS.find((f) => f.id === coberturaSelecionada.value) || CAKE_FROSTINGS[0]
  return { name: f.name, color: f.color, style: f.style }
})"""
)

# Atualizar recheiosSelecionadosMapeados para usar CAKE_FILLINGS
antigo_recheios_comp = """const recheiosSelecionadosMapeados = computed(() =>
  recheiosSelecionados.value.map((r) => RECHEIOS_MAP[r] || RECHEIOS_MAP.ninho)
)"""
assert antigo_recheios_comp in s, 'recheiosSelecionadosMapeados não encontrado'
s = s.replace(
    antigo_recheios_comp,
    """const recheiosSelecionadosMapeados = computed(() =>
  recheiosSelecionados.value.map((r) => {
    const f = CAKE_FILLINGS.find((ff) => ff.id === r) || CAKE_FILLINGS[0]
    return { name: f.name, color: f.color }
  })
)"""
)

open(p, 'w', encoding='utf-8').write(s)
print('CakeBuilder.vue atualizado com cakeBuilderConfig')
