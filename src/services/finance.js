/**
 * Camada de dados - Fluxo de Caixa (financial_transactions)
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function toTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    description: row.description,
    amount: Number(row.amount) || 0,
    transactionDate: row.transaction_date,
    paymentMethod: row.payment_method,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    createdAt: row.created_at,
  }
}

export const financeService = {
  /**
   * Lista lançamentos com filtros opcionais.
   * filters: { type?, category?, startDate?, endDate? }
   */
  async list(filters = {}) {
    if (!isSupabaseConfigured()) return []
    let query = supabase
      .from('financial_transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.startDate) {
      query = query.gte('transaction_date', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('transaction_date', filters.endDate)
    }

    const { data, error } = await query
    if (error) {
      console.warn('[finance] Supabase indisponível.', error.message)
      return []
    }
    return (data || []).map(toTransaction)
  },

  async get(id) {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data ? toTransaction(data) : null
  },

  async create(payload) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert({
        type: payload.type,
        category: payload.category,
        description: payload.description,
        amount: payload.amount,
        transaction_date: payload.transactionDate,
        payment_method: payload.paymentMethod || 'Pix',
        reference_type: payload.referenceType || null,
        reference_id: payload.referenceId || null,
      })
      .select()
      .single()
    if (error) throw error
    return data ? toTransaction(data) : null
  },

  async update(id, payload) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('financial_transactions')
      .update({
        type: payload.type,
        category: payload.category,
        description: payload.description,
        amount: payload.amount,
        transaction_date: payload.transactionDate,
        payment_method: payload.paymentMethod || 'Pix',
        reference_type: payload.referenceType || null,
        reference_id: payload.referenceId || null,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data ? toTransaction(data) : null
  },

  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('financial_transactions').delete().eq('id', id)
    if (error) throw error
    return true
  },

  /**
   * Insere ou atualiza um lançamento vinculado a uma referência (pedido ou nota fiscal),
   * evitando duplicados graças ao índice único parcial (reference_type, reference_id).
   */
  async upsertByReference(referenceType, referenceId, payload) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')

    // Verifica se já existe lançamento para esta referência
    const { data: existing } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('reference_type', referenceType)
      .eq('reference_id', referenceId)
      .maybeSingle()

    if (existing) {
      return await this.update(existing.id, {
        type: payload.type,
        category: payload.category,
        description: payload.description,
        amount: payload.amount,
        transactionDate: payload.transactionDate,
        paymentMethod: payload.paymentMethod || 'Pix',
        referenceType: payload.referenceType || referenceType,
        referenceId: payload.referenceId || referenceId,
      })
    }

    return await this.create({
      type: payload.type,
      category: payload.category,
      description: payload.description,
      amount: payload.amount,
      transactionDate: payload.transactionDate,
      paymentMethod: payload.paymentMethod || 'Pix',
      referenceType: payload.referenceType || referenceType,
      referenceId: payload.referenceId || referenceId,
    })
  },

  /**
   * Remove lançamentos vinculados a uma referência (ex: pedido cancelado).
   */
  async removeByReference(referenceType, referenceId) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('reference_type', referenceType)
      .eq('reference_id', referenceId)
    if (error) throw error
    return true
  },
}
