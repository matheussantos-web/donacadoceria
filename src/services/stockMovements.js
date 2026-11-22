/**
 * Camada de dados - Movimentações de Estoque (stock_movements)
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function toMovement(row) {
  return {
    id: row.id,
    ingredientId: row.ingredient_id,
    movementType: row.movement_type,
    quantity: Number(row.quantity) || 0,
    reason: row.reason,
    referenceId: row.reference_id,
    createdAt: row.created_at,
  }
}

export const stockMovementsService = {
  /**
   * Lista as movimentações de um insumo, mais recentes primeiro.
   */
  async listByIngredient(ingredientId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('ingredient_id', ingredientId)
      .order('created_at', { ascending: false })
    if (error) {
      console.warn('[stockMovements] Supabase indisponível.', error.message)
      return []
    }
    return (data || []).map(toMovement)
  },

  /**
   * Cria um ajuste manual de estoque:
   * - Atualiza stock_quantity do insumo (somando para entrada, subtraindo para saída).
   * - Registra o movimento em stock_movements.
   */
  async createManualAdjustment({ ingredientId, movementType, quantity, reason }) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')

    // Carrega o estoque atual do insumo
    const { data: ing, error: ingErr } = await supabase
      .from('ingredients')
      .select('stock_quantity')
      .eq('id', ingredientId)
      .single()
    if (ingErr) throw ingErr

    const currentStock = Number(ing.stock_quantity) || 0
    const newStock =
      movementType === 'entrada'
        ? currentStock + Number(quantity)
        : currentStock - Number(quantity)

    // Atualiza o estoque do insumo
    const { error: updErr } = await supabase
      .from('ingredients')
      .update({ stock_quantity: newStock })
      .eq('id', ingredientId)
    if (updErr) throw updErr

    // Registra o movimento
    const { error: movErr } = await supabase.from('stock_movements').insert({
      ingredient_id: ingredientId,
      movement_type: movementType,
      quantity: Number(quantity),
      reason: reason || 'Ajuste manual',
      reference_id: null,
    })
    if (movErr) throw movErr

    return { newStock }
  },
}
