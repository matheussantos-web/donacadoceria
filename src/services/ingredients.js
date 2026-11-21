/**
 * Camada de dados - Insumos (ingredients)
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { recalculateCostsService } from '@/services/recalculateCosts'

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
    updatedAt: row.updated_at,
  }
}

export const ingredientsService = {
  async list() {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    if (error) {
      console.warn('[ingredients] Supabase indisponível.', error.message)
      return []
    }
    return (data || []).map(toIngredient)
  },

  async get(id) {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase.from('ingredients').select('*').eq('id', id).single()
    if (error) return null
    return data ? toIngredient(data) : null
  },

  async create(ingredient) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('ingredients')
      .insert({
        name: ingredient.name,
        brand: ingredient.brand,
        category: ingredient.category,
        purchase_unit: ingredient.purchaseUnit,
        package_size: ingredient.packageSize,
        base_unit: ingredient.baseUnit,
        last_unit_cost: ingredient.lastUnitCost,
        stock_quantity: ingredient.stockQuantity,
        min_stock_alert: ingredient.minStockAlert,
      })
      .select()
      .single()
    if (error) throw error
    await recalculateCostsService.recalculateAllCosts().catch((err) =>
      console.warn('[ingredients] Recalculo em cascata falhou:', err.message)
    )
    return data ? toIngredient(data) : null
  },

  async update(id, ingredient) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('ingredients')
      .update({
        name: ingredient.name,
        brand: ingredient.brand,
        category: ingredient.category,
        purchase_unit: ingredient.purchaseUnit,
        package_size: ingredient.packageSize,
        base_unit: ingredient.baseUnit,
        last_unit_cost: ingredient.lastUnitCost,
        stock_quantity: ingredient.stockQuantity,
        min_stock_alert: ingredient.minStockAlert,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await recalculateCostsService.recalculateAllCosts().catch((err) =>
      console.warn('[ingredients] Recalculo em cascata falhou:', err.message)
    )
    return data ? toIngredient(data) : null
  },

  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('ingredients').delete().eq('id', id)
    if (error) throw error
    return true
  },
}
