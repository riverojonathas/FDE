'use client'

import React from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { 
  Clock, 
  Target, 
  DollarSign, 
  Award,
  Users,
  School,
  GraduationCap,
  MapPin,
  TrendingUp,
  AlertCircle,
  LayoutDashboard
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"
import { LAYOUT_CONSTANTS } from "@/constants/layout"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="py-6 space-y-6">
        <PageHeader
          title="Dashboard"
          description="Visão geral do sistema de avaliação"
          icon={<LayoutDashboard className="h-6 w-6" />}
        />

        {/* Performance do Sistema */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#0A0F1C] border-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Tempo Médio</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono text-slate-100">0.0s</span>
                  <span className="text-xs text-slate-500">por correção</span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0A0F1C] border-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Precisão</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono text-slate-100">98.5%</span>
                  <span className="text-xs text-slate-500">taxa de acerto</span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0A0F1C] border-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Custo Estimado</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono text-slate-100">$0.00</span>
                  <span className="text-xs text-slate-500">por 1000 correções</span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0A0F1C] border-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Nota Média</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono text-slate-100">0.0/10</span>
                  <span className="text-xs text-slate-500">geral</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Alcance do Sistema */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Alcance do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#0A0F1C] border-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-slate-400">Alunos</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono text-slate-100">3.5M+</span>
                  <span className="text-xs text-slate-500">beneficiados</span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0A0F1C] border-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <School className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-slate-400">Escolas</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono text-slate-100">5.4K+</span>
                  <span className="text-xs text-slate-500">atendidas</span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0A0F1C] border-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-slate-400">Professores</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono text-slate-100">190K+</span>
                  <span className="text-xs text-slate-500">apoiados</span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0A0F1C] border-slate-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-slate-400">Municípios</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono text-slate-100">645</span>
                  <span className="text-xs text-slate-500">alcançados</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Insights */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Insights da IA
          </h2>
          <Card className="bg-[#0A0F1C] border-slate-800">
            <div className="p-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-slate-100 mb-3">Principais Áreas para Melhoria</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    Argumentação e fundamentação
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    Uso de exemplos específicos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    Clareza na exposição de ideias
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-100 mb-3">Ações Recomendadas</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    Focar em exercícios de argumentação
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    Criar banco de exemplos históricos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    Praticar estruturação de textos
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </MainLayout>
  )
} 