/**
 * Camada de dados - Pedidos, Encomendas e Baixa de Estoque
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { financeService } from './finance'

function toOrder(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone || '',
    deliveryDate: row.delivery_date,
    status: row.status,
    totalAmount: Number(row.total_amount) || 0,
    depositPaid: Number(row.deposit_paid) || 0,
    paymentStatus: row.payment_status,
    notes: row.notes || '',
    stockDeducted: Boolean(row.stock_deducted),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toOrderItem(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    pricedProductId: row.priced_product_id,
    productName: row.product_name,
    quantity: Number(row.quantity) || 0,
    unitPrice: Number(row.unit_price) || 0,
    subtotal: Number(row.subtotal) || 0,
  }
}

export const ordersService = {
  async list() {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('delivery_date', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) {
      console.warn('[orders] Supabase indisponível.', error.message)
      return []
    }
    return (data || []).map(toOrder)
  },

  async get(id) {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data ? toOrder(data) : null
  },

  async getWithItems(id) {
    if (!isSupabaseConfigured()) return null
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()
    if (orderErr) return null
    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id)
      .order('id', { ascending: true })
    if (itemsErr) return null
    return {
      ...toOrder(order),
      items: (items || []).map(toOrderItem),
    }
  },

  async create(orderPayload, itemsPayload) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name: orderPayload.customerName,
        customer_phone: orderPayload.customerPhone,
        delivery_date: orderPayload.deliveryDate,
        status: orderPayload.status || 'pendente',
        total_amount: orderPayload.totalAmount || 0,
        deposit_paid: orderPayload.depositPaid || 0,
        payment_status: orderPayload.paymentStatus || 'pendente',
        notes: orderPayload.notes || '',
      })
      .select()
      .single()
    if (orderErr) throw orderErr

    for (const item of itemsPayload || []) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        priced_product_id: item.pricedProductId || null,
        product_name: item.productName,
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0,
        subtotal: item.subtotal || 0,
      })
    }

    return { ...toOrder(order), items: (itemsPayload || []).map((i) => ({ ...i })) }
  },

  async update(id, orderPayload, itemsPayload) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .update({
        customer_name: orderPayload.customerName,
        customer_phone: orderPayload.customerPhone,
        delivery_date: orderPayload.deliveryDate,
        status: orderPayload.status,
        total_amount: orderPayload.totalAmount || 0,
        deposit_paid: orderPayload.depositPaid || 0,
        payment_status: orderPayload.paymentStatus,
        notes: orderPayload.notes || '',
      })
      .eq('id', id)
      .select()
      .single()
    if (orderErr) throw orderErr

    // Recria os itens do pedido
    await supabase.from('order_items').delete().eq('order_id', id)
    for (const item of itemsPayload || []) {
      await supabase.from('order_items').insert({
        order_id: id,
        priced_product_id: item.pricedProductId || null,
        product_name: item.productName,
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0,
        subtotal: item.subtotal || 0,
      })
    }

    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id)
      .order('id', { ascending: true })
    if (itemsErr) throw itemsErr

    return { ...toOrder(order), items: (items || []).map(toOrderItem) }
  },

  async remove(id) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) throw error
    return true
  },

  /**
   * Baixa o estoque dos insumos consumidos por este pedido.
   * Somente se ainda não foi baixado (stock_deducted = false).
   * Percorre: order_item -> produto -> componentes (receita) -> ingredientes.
   */
  async deductOrderStock(orderId) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('stock_deducted')
      .eq('id', orderId)
      .single()
    if (orderErr) throw orderErr
    if (order.stock_deducted) return { deducted: false, reason: 'already' }

    const { data: orderItems, error: itemsErr } = await supabase
      .from('order_items')
      .select('id, quantity, priced_product_id')
      .eq('order_id', orderId)
    if (itemsErr) throw itemsErr

    // Agrupar consumo por ingrediente
    const consumption = new Map()
    for (const item of orderItems || []) {
      if (!item.priced_product_id) continue

      const { data: components, error: compErr } = await supabase
        .from('priced_product_components')
        .select('recipe_id, multiplier_or_qty')
        .eq('priced_product_id', item.priced_product_id)
      if (compErr || !components) continue

      for (const comp of components) {
        const { data: recipeIngredients, error: riErr } = await supabase
          .from('recipe_ingredients')
          .select('ingredient_id, quantity_used')
          .eq('recipe_id', comp.recipe_id)
        if (riErr || !recipeIngredients) continue

        for (const ri of recipeIngredients) {
          const qty = Number(item.quantity) * Number(comp.multiplier_or_qty) * Number(ri.quantity_used)
          const key = ri.ingredient_id
          consumption.set(key, (consumption.get(key) || 0) + qty)
        }
      }
    }

    // Aplicar baixa no estoque e registrar movimentos de saída
    for (const [ingredientId, qty] of consumption.entries()) {
      const { data: ing, error: ingErr } = await supabase
        .from('ingredients')
        .select('stock_quantity')
        .eq('id', ingredientId)
        .single()
      if (ingErr) continue

      const newStock = Number(ing.stock_quantity || 0) - qty
      await supabase
        .from('ingredients')
        .update({ stock_quantity: newStock })
        .eq('id', ingredientId)

      await supabase.from('stock_movements').insert({
        ingredient_id: ingredientId,
        movement_type: 'saida',
        quantity: qty,
        reason: `Encomenda #${orderId}`,
        reference_id: orderId,
      })
    }

    // Marcar pedido como estoque baixado
    await supabase
      .from('orders')
      .update({ stock_deducted: true })
      .eq('id', orderId)

    return { deducted: true, consumption: Object.fromEntries(consumption) }
  },

  /**
   * Estorna o estoque de um pedido cancelado que já havia sido baixado.
   */
  async restoreOrderStock(orderId) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('stock_deducted')
      .eq('id', orderId)
      .single()
    if (orderErr) throw orderErr
    if (!order.stock_deducted) return { restored: false, reason: 'not_deducted' }

    const { data: movements, error: movErr } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('reference_id', orderId)
      .eq('movement_type', 'saida')
    if (movErr) throw movErr

    for (const mov of movements || []) {
      const { data: ing, error: ingErr } = await supabase
        .from('ingredients')
        .select('stock_quantity')
        .eq('id', mov.ingredient_id)
        .single()
      if (ingErr) continue

      const newStock = Number(ing.stock_quantity || 0) + Number(mov.quantity)
      await supabase
        .from('ingredients')
        .update({ stock_quantity: newStock })
        .eq('id', mov.ingredient_id)

      await supabase.from('stock_movements').insert({
        ingredient_id: mov.ingredient_id,
        movement_type: 'entrada',
        quantity: Number(mov.quantity),
        reason: `Estorno Encomenda #${orderId}`,
        reference_id: orderId,
      })
    }

    await supabase
      .from('orders')
      .update({ stock_deducted: false })
      .eq('id', orderId)

    return { restored: true }
  },

  /**
   * Sincroniza o lançamento financeiro de entrada de um pedido.
   * - Se pagamento completo (pago): lançamento de entrada com total_amount.
   * - Se sinal pago (sinal_pago / deposit_paid > 0): lançamento com deposit_paid.
   * - Se cancelado: remove lançamento vinculado.
   */
  async syncOrderPayment(order) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.')

    const isPaid = order.paymentStatus === 'pago' || order.paymentStatus === 'pago_integral'
    const hasDeposit = order.depositPaid && Number(order.depositPaid) > 0

    // Cancelado: remove lançamento financeiro vinculado
    if (order.status === 'cancelado') {
      await financeService.removeByReference('order', order.id)
      return { synced: false, reason: 'cancelled' }
    }

    if (isPaid) {
      return await financeService.upsertByReference('order', order.id, {
        type: 'entrada',
        category: 'Encomendas',
        description: `Encomenda - ${order.customerName}`,
        amount: Number(order.totalAmount) || 0,
        transactionDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        paymentMethod: 'Pix',
        referenceType: 'order',
        referenceId: order.id,
      })
    }

    if (hasDeposit) {
      return await financeService.upsertByReference('order', order.id, {
        type: 'entrada',
        category: 'Encomendas',
        description: `Encomenda - ${order.customerName} (sinal)`,
        amount: Number(order.depositPaid),
        transactionDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        paymentMethod: 'Pix',
        referenceType: 'order',
        referenceId: order.id,
      })
    }

    // Sem pagamento: remove lançamento se existir (idempotente - não lança nada)
    await financeService.removeByReference('order', order.id)
    return { synced: false, reason: 'no_payment' }
  },
}
