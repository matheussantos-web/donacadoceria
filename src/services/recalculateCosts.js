
/**
 * Serviço de recálculo automático em cascata de custos.
 *
 * Chamado sempre que um insumo tem seu preço alterado (via nota fiscal ou edição manual):
 * 1. Recalcula total_cost de todas as receitas baseado nos recipe_ingredients + overhead + labor
 * 2. Recalcula total_production_cost de todos os produtos finais baseado nos priced_product_components
 *
 * Colunas geradas pelo PostgreSQL (NÃO enviar no UPDATE):
 *   - recipes.unit_cost = total_cost / yield_quantity
 *   - priced_products.suggested_price = total_production_cost / (1 - target_margin_percent / 100)
 *   - ingredients.cost_per_base_unit = last_unit_cost / package_size
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/** Normaliza um valor monetário para número */
function toNum(v) {
  return Number(v) || 0
}

/** Arredonda para 2 casas decimais (moeda) */
function round2(v) {
  return Math.round(v * 100) / 100
}

export const recalculateCostsService = {
  /**
   * Executa recálculo em cascata de todos os custos.
   * Deve ser chamado após qualquer alteração no custo de insumos.
   * Retorna um resumo do que foi recalculado.
   */
  async recalculateAllCosts() {
    if (!isSupabaseConfigured()) {
      console.warn('[recalculateCosts] Supabase não configurado. Pulando recálculo.')
      return { recipesUpdated: 0, productsUpdated: 0 }
    }

    let recipesUpdated = 0
    let productsUpdated = 0

    // --- Passo 1: Carregar todos os insumos com custo por unidade base ---
    const { data: ingredients, error: ingErr } = await supabase
      .from('ingredients')
      .select('id, cost_per_base_unit, last_unit_cost, package_size, base_unit')

    if (ingErr) {
      console.error('[recalculateCosts] Erro ao carregar insumos:', ingErr.message)
      return { recipesUpdated: 0, productsUpdated: 0 }
    }

    const ingredientMap = new Map()
    ;(ingredients || []).forEach((i) => {
      ingredientMap.set(i.id, {
        id: i.id,
        costPerBaseUnit: toNum(i.cost_per_base_unit),
      })
    })

    // --- Passo 2: Recalcular todas as receitas ---
    const { data: recipes, error: recErr } = await supabase
      .from('recipes')
      .select('id, total_cost, overhead_percent, labor_cost, yield_quantity')

    if (recErr) {
      console.error('[recalculateCosts] Erro ao carregar receitas:', recErr.message)
      return { recipesUpdated: 0, productsUpdated: 0 }
    }

    for (const recipe of recipes || []) {
      // Carregar ingredientes desta receita
      const { data: recipeIngredients, error: riErr } = await supabase
        .from('recipe_ingredients')
        .select('ingredient_id, quantity_used, ingredients(cost_per_base_unit)')
        .eq('recipe_id', recipe.id)

      if (riErr || !recipeIngredients) {
        console.error(`[recalculateCosts] Erro ao carregar ingredientes da receita ${recipe.id}:`, riErr?.message)
        continue
      }

      // Somatório: quantidade_usada * custo_por_unidade_base do insumo
      let ingredientsCost = 0
      for (const ri of recipeIngredients) {
        const ing = ingredientMap.get(ri.ingredient_id)
        const costPerUnit = ing ? ing.costPerBaseUnit : toNum(ri.ingredients?.cost_per_base_unit)
        ingredientsCost += toNum(ri.quantity_used) * costPerUnit
      }

      const overhead = toNum(recipe.overhead_percent) / 100
      const labor = toNum(recipe.labor_cost)
      const totalCost = round2((ingredientsCost * (1 + overhead)) + labor)

      // Atualizar apenas total_cost (unit_cost é gerado pelo banco)
      const { error: updErr } = await supabase
        .from('recipes')
        .update({ total_cost })
        .eq('id', recipe.id)

      if (updErr) {
        console.error(`[recalculateCosts] Erro ao atualizar receita ${recipe.id}:`, updErr.message)
        continue
      }
      recipesUpdated++
    }

    // --- Passo 3: Recalcular todos os produtos finais ---
    const { data: pricedProducts, error: ppErr } = await supabase
      .from('priced_products')
      .select('id, total_production_cost, target_margin_percent')

    if (ppErr) {
      console.error('[recalculateCosts] Erro ao carregar produtos precificados:', ppErr.message)
      return { recipesUpdated, productsUpdated: 0 }
    }

    // Carregar todas as receitas novamente (com unit_cost atualizado)
    const { data: allRecipes, error: allRecErr } = await supabase
      .from('recipes')
      .select('id, unit_cost')

    if (allRecErr) {
      console.error('[recalculateCosts] Erro ao carregar receitas para precificação:', allRecErr.message)
      return { recipesUpdated, productsUpdated: 0 }
    }

    const recipeCostMap = new Map()
    ;(allRecipes || []).forEach((r) => {
      recipeCostMap.set(r.id, toNum(r.unit_cost))
    })

    for (const product of pricedProducts || []) {
      // Carregar componentes deste produto
      const { data: components, error: compErr } = await supabase
        .from('priced_product_components')
        .select('recipe_id, multiplier_or_qty, recipes(unit_cost)')
        .eq('priced_product_id', product.id)

      if (compErr || !components) {
        console.error(`[recalculateCosts] Erro ao carregar componentes do produto ${product.id}:`, compErr?.message)
        continue
      }

      let productionCost = 0
      for (const comp of components) {
        const recipeUnitCost = recipeCostMap.get(comp.recipe_id) ?? toNum(comp.recipes?.unit_cost)
        productionCost += toNum(comp.multiplier_or_qty) * recipeUnitCost
      }

      const totalProductionCost = round2(productionCost)

      // Atualizar apenas total_production_cost (suggested_price é gerado pelo banco)
      const { error: updErr } = await supabase
        .from('priced_products')
        .update({ total_production_cost })
        .eq('id', product.id)

      if (updErr) {
        console.error(`[recalculateCosts] Erro ao atualizar produto ${product.id}:`, updErr.message)
        continue
      }
      productsUpdated++
    }

    return { recipesUpdated, productsUpdated }
  },
}
