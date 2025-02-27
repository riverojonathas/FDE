'use client'

import { useState, useEffect } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { getAvailableQuestions } from '@/lib/supabase/manual-pipeline'
import { Loader2, Info } from 'lucide-react'

interface QuestionSelectorProps {
  onSelect: (questionId: string) => void
  selectedId: string
}

interface Question {
  id: string
  title: string
  code: string
  prompt: string
  topic?: string
  level?: string
}

export function QuestionSelector({ onSelect, selectedId }: QuestionSelectorProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true)
      try {
        const data = await getAvailableQuestions()
        if (data) {
          setQuestions(data)
          setFilteredQuestions(data)
        }
      } catch (error) {
        console.error('Erro ao carregar questões:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadQuestions()
  }, [])

  // Filtrar questões em tempo real enquanto o usuário digita
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredQuestions(questions)
      return
    }
    
    const lowerCaseSearch = searchValue.toLowerCase()
    const filtered = questions.filter(
      question => 
        question.code.toLowerCase().includes(lowerCaseSearch) || 
        question.title.toLowerCase().includes(lowerCaseSearch)
    )
    setFilteredQuestions(filtered)
  }, [searchValue, questions])

  const selectedQuestion = questions.find(q => q.id === selectedId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Texto de instrução acima do seletor */}
      <div className="flex items-center text-sm text-muted-foreground mb-1">
        <Info className="h-4 w-4 mr-1" />
        Digite para filtrar questões automaticamente. Clique em uma questão para selecioná-la.
      </div>
      
      <Command className="border rounded-md">
        <CommandInput 
          placeholder="Digite código ou título da questão..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList className="max-h-52 overflow-auto">
          <CommandEmpty>Nenhuma questão encontrada com "{searchValue}".</CommandEmpty>
          <CommandGroup heading="Questões">
            {filteredQuestions.map((question) => (
              <CommandItem
                key={question.id}
                value={`${question.code} ${question.title}`}
                onSelect={() => {
                  onSelect(question.id)
                  // Feedback visual de que a questão foi selecionada
                  setTimeout(() => {
                    const element = document.getElementById(`question-${question.id}`)
                    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }, 100)
                }}
                className={`cursor-pointer transition-colors duration-200 ${
                  question.id === selectedId ? 'bg-primary/10 font-medium border-l-4 border-primary pl-2' : ''
                }`}
                id={`question-${question.id}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{question.code}</span>
                    <span className="truncate">{question.title}</span>
                  </div>
                  {question.topic && (
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                      {question.topic}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      
      {selectedQuestion ? (
        <div className="p-3 border rounded-md bg-muted/40 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <p className="text-sm font-medium">Questão selecionada:</p>
          </div>
          <p className="text-sm font-medium">{selectedQuestion.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{selectedQuestion.prompt}</p>
        </div>
      ) : (
        <div className="p-3 border border-dashed rounded-md bg-muted/20 text-muted-foreground text-sm">
          Nenhuma questão selecionada. Clique em uma questão acima para selecioná-la.
        </div>
      )}
    </div>
  )
} 