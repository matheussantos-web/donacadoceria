
/**
 * Camada de dados - Itens da Nota Fiscal (invoice_items)
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function toInvoiceItem(row) {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    ingredientId: row.ingredient_id,
    rawDescription: row.raw_description,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    totalPrice: Number(row.total_price),
  }
}

export const invoiceItemsService = {
  async listByInvoice(invoiceId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*, ingredients(*)')
      .eq('invoice_id', invoiceId)
      .order('id', { ascending: true })
    if (error) return []
    return (data || []).map(toInvoiceItem)
  },

  async create(item) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('invoice_items')
      .insert({
        invoice_id: item.invoiceId,
        ingredient_id: item.ingredientId,
        raw_description: item.rawDescription,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      })
      .select()
      .single()
    if (error) throw error
    return data ? toInvoiceItem(data) : null
  },

  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('invoice_items').delete().eq('id', id)
    if (error) throw error
    return true
  },
}
