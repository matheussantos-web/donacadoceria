
/**
 * Camada de dados - Notas Fiscais (invoices)
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function toInvoice(row) {
  return {
    id: row.id,
    accessKey: row.access_key,
    storeName: row.store_name,
    issueDate: row.issue_date,
    totalAmount: Number(row.total_amount),
    rawUrl: row.raw_url,
    createdAt: row.created_at,
  }
}

export const invoicesService = {
  async list() {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.warn('[invoices] Supabase indisponível.', error.message)
      return []
    }
    return (data || []).map(toInvoice)
  },

  async get(id) {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single()
    if (error) return null
    return data ? toInvoice(data) : null
  },

  async create(invoice) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        access_key: invoice.accessKey,
        store_name: invoice.storeName,
        issue_date: invoice.issueDate,
        total_amount: invoice.totalAmount,
        raw_url: invoice.rawUrl,
      })
      .select()
      .single()
    if (error) throw error
    return data ? toInvoice(data) : null
  },

  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) throw error
    return true
  },
}
