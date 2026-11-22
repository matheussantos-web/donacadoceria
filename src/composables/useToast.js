/**
 * Composable leve de notificações Toast para a área de gestão.
 * Uso:
 *   const { toast } = useToast()
 *   toast('Sucesso!', { type: 'success', duration: 4000 })
 *
 * Tipos: 'success', 'error', 'warning', 'info'
 */
import { ref } from 'vue'

const toasts = ref([])
let idCounter = 0

export function useToast() {
  function toast(message, options = {}) {
    const id = ++idCounter
    const entry = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration ?? 4000,
      createdAt: Date.now(),
    }
    toasts.value.push(entry)

    // Remove automaticamente após o duration
    setTimeout(() => {
      dismiss(id)
    }, entry.duration)

    return id
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function clear() {
    toasts.value = []
  }

  return {
    toasts: () => toasts.value,
    toast,
    success: (msg, opts) => toast(msg, { type: 'success', ...opts }),
    error: (msg, opts) => toast(msg, { type: 'error', ...opts }),
    warning: (msg, opts) => toast(msg, { type: 'warning', ...opts }),
    info: (msg, opts) => toast(msg, { type: 'info', ...opts }),
    dismiss,
    clear,
  }
}
