'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, BarChart4, Settings } from 'lucide-react'

// Os agentes que temos implementados
const availableAgents = [
  {
    id: "grammar-analysis",
    name: "Análise Gramatical",
    description: "Analisa o texto em busca de erros gramaticais, ortográficos e de pontuação, fornecendo correções e explicações.",
    icon: "📝",
    color: "blue",
    stats: {
      executionCount: 427,
      averageTime: 1.8,
      successRate: 98.2,
      averageSatisfaction: 4.3
    }
  },
  {
    id: "coherence-analysis",
    name: "Análise de Coerência e Coesão",
    description: "Avalia a estrutura lógica do texto, conexões entre ideias, progressão argumentativa e organização dos parágrafos.",
    icon: "🔄",
    color: "purple",
    stats: {
      executionCount: 312,
      averageTime: 2.5,
      successRate: 97.5,
      averageSatisfaction: 4.1
    }
  },
  {
    id: "theme-analysis",
    name: "Análise de Desenvolvimento do Tema",
    description: "Avalia como o texto aborda e desenvolve o tema proposto, analisando argumentação, recursos utilizados e progressão das ideias.",
    icon: "📊",
    color: "green",
    stats: {
      executionCount: 289,
      averageTime: 3.2,
      successRate: 96.8,
      averageSatisfaction: 4.0
    }
  },
  {
    id: "scoring-agent",
    name: "Cálculo de Nota",
    description: "Calcula a nota final com base nos resultados das análises de texto, coerência e desenvolvimento do tema.",
    icon: "🔢",
    color: "amber",
    stats: {
      executionCount: 503,
      averageTime: 0.9,
      successRate: 99.5,
      averageSatisfaction: 4.5
    }
  },
  {
    id: "plagiarism-agent",
    name: "Detecção de Plágio",
    description: "Analisa o texto em busca de sinais de plágio, comparando com uma base de textos de referência.",
    icon: "🔍",
    color: "red",
    stats: {
      executionCount: 201,
      averageTime: 4.7,
      successRate: 95.3,
      averageSatisfaction: 3.8
    }
  },
  {
    id: "feedback-agent",
    name: "Feedback Automatizado",
    description: "Gera feedback detalhado para o aluno com base nos resultados das análises, destacando pontos fortes e sugestões de melhoria.",
    icon: "💬",
    color: "teal",
    stats: {
      executionCount: 411,
      averageTime: 2.8,
      successRate: 98.7,
      averageSatisfaction: 4.2
    }
  }
]

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Em uma implementação real, buscaríamos os dados da API
    // const fetchAgents = async () => {
    //   const response = await fetch('/api/agents')
    //   const data = await response.json()
    //   setAgents(data)
    //   setLoading(false)
    // }
    
    // Para demonstração, usamos dados fictícios com um delay simulado
    setTimeout(() => {
      setAgents(availableAgents)
      setLoading(false)
    }, 1000)
  }, [])
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agentes</h1>
          <p className="text-muted-foreground">
            Gerencie e configure os agentes de IA responsáveis pela pipeline de correção.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações Globais
          </Button>
          <Button>
            <BarChart4 className="h-4 w-4 mr-2" />
            Métricas
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <Link 
              key={agent.id} 
              href={`/dashboard/agents/${agent.id}`}
              className="block"
            >
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xl">
                        {agent.icon}
                      </div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </div>
                    <Badge variant="outline">v1.0</Badge>
                  </div>
                  <CardDescription>
                    {agent.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Execuções</p>
                      <p className="font-medium">{agent.stats.executionCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tempo Médio</p>
                      <p className="font-medium">{agent.stats.averageTime}s</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
                      <p className="font-medium">{agent.stats.successRate}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Satisfação</p>
                      <p className="font-medium">{agent.stats.averageSatisfaction}/5</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Configurar
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 