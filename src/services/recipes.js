/**
 * Camada de dados - Receitas e Preços
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function toRecipe(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    yieldQuantity: Number(row.yield_quantity),
    yieldUnit: row.yield_unit,
    overheadPercent: Number(row.overhead_percent),
    laborCost: Number(row.labor_cost),
    totalCost: Number(row.total_cost),
    unitCost: Number(row.unit_cost),
    notes: row.notes,
    updatedAt: row.updated_at,
  }
}

export const recipesService = {
  async list() {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    if (error) {
      console.warn('[recipes] Supabase indisponível.', error.message)
      return []
    }
    return (data || []).map(toRecipe)
  },

  async get(id) {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single()
    if (error) return null
    return data ? toRecipe(data) : null
  },

  async create(recipe) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        name: recipe.name,
        category: recipe.category,
        yield_quantity: recipe.yieldQuantity,
        yield_unit: recipe.yieldUnit,
        overhead_percent: recipe.overheadPercent,
        labor_cost: recipe.laborCost,
        total_cost: recipe.totalCost,
        notes: recipe.notes,
      })
      .select()
      .single()
    if (error) throw error
    return data ? toRecipe(data) : null
  },

  async update(id, recipe) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('recipes')
      .update({
        name: recipe.name,
        category: recipe.category,
        yield_quantity: recipe.yieldQuantity,
        yield_unit: recipe.yieldUnit,
        overhead_percent: recipe.overheadPercent,
        labor_cost: recipe.laborCost,
        total_cost: recipe.totalCost,
        notes: recipe.notes,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data ? toRecipe(data) : null
  },

  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) throw error
    return true
  },
}

export const recipeIngredientsService = {
  async listByRecipe(recipeId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select('*, ingredients(*)')
      .eq('recipe_id', recipeId)
      .order('id', { ascending: true })
    if (error) return []
    return (data || []).map((row) => ({
      id: row.id,
      recipeId: row.recipe_id,
      ingredientId: row.ingredient_id,
      ingredient: row.ingredients ? toIngredient(row.ingredients) : null,
      quantityUsed: Number(row.quantity_used),
    }))
  },

  async create(recipeIngredient) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert({
        recipe_id: recipeIngredient.recipeId,
        ingredient_id: recipeIngredient.ingredientId,
        quantity_used: recipeIngredient.quantityUsed,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('recipe_ingredients').delete().eq('id', id)
    if (error) throw error
    return true
  },
}

function toIngredient(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    purchaseUnit: row.purchase_unit,
    packageSize: Number(row.package_size),
    baseUnit: row.base_unit,
    lastUnitCost: Number(row.last_unit_cost),
    costPerBaseUnit: Number(row.cost_per_base_unit),
    stockQuantity: Number(row.stock_quantity),
    minStockAlert: Number(row.min_stock_alert),
  }
}

export const pricedProductsService = {
  async list() {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('priced_products')
      .select('*')
      .order('name', { ascending: true })
    if (error) return []
    return (data || []).map(toPricedProduct)
  },

  async get(id) {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase.from('priced_products').select('*').eq('id', id).single()
    if (error) return null
    return data ? toPricedProduct(data) : null
  },

  async create(product) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('priced_products')
      .insert({
        name: product.name,
        product_type: product.productType,
        yield_slices: product.yieldSlices,
        total_production_cost: product.totalProductionCost,
        target_margin_percent: product.targetMarginPercent,
        final_price: product.finalPrice,
        published_to_catalog: product.publishedToCatalog,
      })
      .select()
      .single()
    if (error) throw error
    return data ? toPricedProduct(data) : null
  },

  async update(id, product) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('priced_products')
      .update({
        name: product.name,
        product_type: product.productType,
        yield_slices: product.yieldSlices,
        total_production_cost: product.totalProductionCost,
        target_margin_percent: product.targetMarginPercent,
        final_price: product.finalPrice,
        published_to_catalog: product.publishedToCatalog,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data ? toPricedProduct(data) : null
  },

  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('priced_products').delete().eq('id', id)
    if (error) throw error
    return true
  },
}

export const pricedProductComponentsService = {
  async listByProduct(pricedProductId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('priced_product_components')
      .select('*, recipes(*)')
      .eq('priced_product_id', pricedProductId)
      .order('id', { ascending: true })
    if (error) return []
    return (data || []).map((row) => ({
      id: row.id,
      pricedProductId: row.priced_product_id,
      recipeId: row.recipe_id,
      recipe: row.recipes ? toRecipe(row.recipes) : null,
      multiplierOrQty: Number(row.multiplier_or_qty),
    }))
  },

  async create(component) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('priced_product_components')
      .insert({
        priced_product_id: component.pricedProductId,
        recipe_id: component.recipeId,
        multiplier_or_qty: component.multiplierOrQty,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('priced_product_components').delete().eq('id', id)
    if (error) throw error
    return true
  },
}

function toPricedProduct(row) {
  return {
    id: row.id,
    name: row.name,
    productType: row.product_type,
    yieldSlices: row.yield_slices,
    totalProductionCost: Number(row.total_production_cost),
    targetMarginPercent: Number(row.target_margin_percent),
    suggestedPrice: Number(row.suggested_price),
    finalPrice: Number(row.final_price),
    publishedToCatalog: row.published_to_catalog,
    updatedAt: row.updated_at,
  }
}
