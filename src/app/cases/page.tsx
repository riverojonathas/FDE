'use client'

import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  School,
  Users,
  LineChart,
  Clock,
  CheckCircle2,
  BookOpen,
  BrainCircuit,
  Sparkles,
  ArrowRight
} from "lucide-react"

const cases = [
  {
    title: "SARESP - Avaliação em Larga Escala",
    description: "Correção automatizada de redações do Sistema de Avaliação de Rendimento Escolar do Estado de São Paulo",
    metrics: [
      { label: "Redações Corrigidas", value: "500k+" },
      { label: "Tempo Médio", value: "45s" },
      { label: "Precisão", value: "97.8%" },
      { label: "Economia", value: "85%" }
    ],
    tags: ["Larga Escala", "Redação", "IA", "Automação"],
    icon: School
  },
  {
    title: "Avaliações Diagnósticas",
    description: "Processamento de avaliações diagnósticas bimestrais da rede estadual",
    metrics: [
      { label: "Escolas", value: "5.000+" },
      { label: "Alunos", value: "2M+" },
      { label: "Questões/Mês", value: "10M" },
      { label: "Tempo Resposta", value: "<1min" }
    ],
    tags: ["Diagnóstico", "Analytics", "Tempo Real"],
    icon: BrainCircuit
  },
  {
    title: "Banco de Questões Comentadas",
    description: "Análise e feedback automático para banco de questões da Secretaria",
    metrics: [
      { label: "Questões", value: "50k+" },
      { label: "Feedbacks", value: "150k+" },
      { label: "Precisão", value: "95%" },
      { label: "Critérios", value: "12" }
    ],
    tags: ["Feedback", "Qualidade", "Curadoria"],
    icon: BookOpen
  }
]

export default function CasesPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <PageHeader
          title="Cases de Uso"
          description="Aplicações práticas do sistema de correção automatizada na rede estadual"
        />

        <div className="space-y-12">
          {cases.map((case_, index) => {
            const Icon = case_.icon
            return (
              <Card key={index} className="bg-slate-900 border-slate-800">
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {case_.title}
                        </h2>
                        <p className="mt-1 text-slate-400">
                          {case_.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {case_.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-blue-500/50 text-blue-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {case_.metrics.map((metric) => (
                      <div key={metric.label} className="space-y-1">
                        <div className="text-2xl font-mono text-blue-400">
                          {metric.value}
                        </div>
                        <div className="text-sm text-slate-400">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Results */}
                  <div className="border-t border-slate-800 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                      Resultados Alcançados
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-400" />
                          <span className="text-slate-300">Redução de 85% no tempo de correção</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span className="text-slate-300">Aumento de 30% na consistência</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-400" />
                          <span className="text-slate-300">Maior engajamento dos professores</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <LineChart className="h-4 w-4 text-green-400" />
                          <span className="text-slate-300">Insights em tempo real</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-400">
            Projeto desenvolvido pela equipe de Tecnologia da FDE - Fundação para o Desenvolvimento da Educação
          </p>
        </div>
      </div>
    </MainLayout>
  )
} 