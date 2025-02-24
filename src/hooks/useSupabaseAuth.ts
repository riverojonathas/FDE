import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'

export function useSupabaseAuth() {
  const setUser = useAppStore((state) => state.setUser)
  const setLoading = useAppStore((state) => state.setLoading)

  useEffect(() => {
    setLoading(true)
    
    // Verifica se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Busca informações adicionais do usuário
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: data.name,
                role: data.role,
              })
            }
          })
      }
      setLoading(false)
    })

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (data) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: data.name,
              role: data.role,
            })
          }
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  return {
    login: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }
} 