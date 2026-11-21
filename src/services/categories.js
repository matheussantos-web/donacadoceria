/**
 * Camada de dados de categorias para a Dona Cá Doceria.
 *
 * Estratégia:
 * - Se o Supabase estiver configurado, lê/escreve no Postgres.
 * - Caso contrário, cai de volta para o catálogo estático em src/data/products.js.
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { categories as fallbackCategories } from '@/data/products'

function toCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayOrder: row.display_order,
    active: row.active,
    createdAt: row.created_at,
  }
}

export const categoryService = {
  /** Lista categorias ativas ordenadas por display_order. */
  async list() {
    if (!isSupabaseConfigured()) {
      return fallbackCategories.filter(c => c.active !== false)
    }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })
    if (error) {
      console.warn('[categories] Supabase indisponível, usando fallback estático.', error.message)
      return fallbackCategories.filter(c => c.active !== false)
    }
    return (data || []).map(toCategory)
  },

  /** Busca uma categoria pelo id. */
  async get(id) {
    if (!isSupabaseConfigured()) {
      return fallbackCategories.find((c) => c.id === id) || null
    }
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single()
    if (error) return null
    return data ? toCategory(data) : null
  },

  /** Cria uma categoria (requer autenticação + RLS). */
  async create(category) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        display_order: category.displayOrder ?? 0,
        active: category.active ?? true,
      })
      .select()
      .single()
    if (error) throw error
    return data ? toCategory(data) : null
  },

  /** Atualiza uma categoria (requer autenticação + RLS). */
  async update(id, category) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: category.name,
        slug: category.slug,
        display_order: category.displayOrder ?? 0,
        active: category.active ?? true,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data ? toCategory(data) : null
  },

  /** Remove uma categoria (requer autenticação + RLS). */
  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    return true
  },
}
