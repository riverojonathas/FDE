import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { supabase, testConnection } from '@/lib/supabase'

export function useQuestions() {
  const setQuestions = useAppStore((state) => state.setQuestions)

  useEffect(() => {
    async function loadQuestions() {
      console.log('Testando conexão com Supabase...')
      const isConnected = await testConnection()
      
      if (!isConnected) {
        console.error('Não foi possível conectar ao Supabase')
        return
      }

      console.log('Carregando questões...')
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar questões:', error)
        return
      }

      console.log('Questões carregadas:', data)
      setQuestions(data)
    }

    loadQuestions()
  }, [setQuestions])
} 