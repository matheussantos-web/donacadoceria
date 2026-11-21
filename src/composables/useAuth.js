import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const user = ref(null)
const authReady = ref(false)

export function useAuth() {
  /** Sessão atual (null se não autenticado). */
  const currentUser = user

  /** Indica se a sessão inicial já foi carregada. */
  const isAuthReady = authReady

  /** Promise que resolve quando a sessão inicial for carregada. */
  const authReadyPromise = (async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    authReady.value = true
  })()

  /** Inicializa o escuta de mudanças de auth do Supabase. */
  function initAuth() {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
      authReady.value = true
    })
  }

  /** Login com email e senha. Atualiza o estado reativo imediatamente. */
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    // Atualiza imediatamente o estado reativo antes de navegar
    user.value = data.user ?? null
    authReady.value = true
    return data
  }

  /** Cadastro com email e senha (opcional; pode ser desabilitado no Supabase). */
  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    user.value = data.user ?? null
    authReady.value = true
    return data
  }

  /** Logout. */
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    authReady.value = true
  }

  /** Verifica se há usuário logado. */
  function isAuthenticated() {
    return Boolean(user.value)
  }

  return {
    currentUser,
    isAuthReady,
    authReadyPromise,
    initAuth,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  }
}

export default { useAuth }
