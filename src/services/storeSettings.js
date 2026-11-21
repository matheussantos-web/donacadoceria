/**
 * Camada de dados de configurações globais da loja (store_settings).
 * É um registro singleton com id = 1.
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function toSettings(row) {
  return {
    id: row.id,
    storeName: row.store_name,
    whatsappNumber: row.whatsapp_number,
    instagramUrl: row.instagram_url,
    contactEmail: row.contact_email,
    isOpen: row.is_open,
    announcementText: row.announcement_text,
    announcementActive: row.announcement_active,
    pickupAddress: row.pickup_address,
    pickupHours: row.pickup_hours,
    pixKey: row.pix_key,
    updatedAt: row.updated_at,
  }
}

export const storeSettingsService = {
  /** Busca as configurações globais (id = 1). */
  async get() {
    if (!isSupabaseConfigured()) {
      return null
    }
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) return null
    return data ? toSettings(data) : null
  },

  /** Atualiza as configurações globais (requer autenticação + RLS). */
  async update(settings) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data, error } = await supabase
      .from('store_settings')
      .update({
        store_name: settings.storeName,
        whatsapp_number: settings.whatsappNumber,
        instagram_url: settings.instagramUrl,
        contact_email: settings.contactEmail,
        is_open: settings.isOpen,
        announcement_text: settings.announcementText,
        announcement_active: settings.announcementActive,
        pickup_address: settings.pickupAddress,
        pickup_hours: settings.pickupHours,
        pix_key: settings.pixKey,
      })
      .eq('id', 1)
      .select()
      .single()
    if (error) throw error
    return data ? toSettings(data) : null
  },
}
