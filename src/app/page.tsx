'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Cpu, 
  LineChart, 
  Users, 
  Scale,
  Clock,
  Database,
  Shield,
  Code,
  Network,
  GitBranch,
  Workflow,
  BookOpen,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de avaliação
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-card-foreground">Tempo Médio</h3>
            <p className="text-4xl font-bold text-foreground">0.0s</p>
            <p className="text-sm text-muted-foreground">por correção</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-card-foreground">Precisão</h3>
            <p className="text-4xl font-bold text-foreground">98.5%</p>
            <p className="text-sm text-muted-foreground">taxa de acerto</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-card-foreground">Custo Estimado</h3>
            <p className="text-4xl font-bold text-foreground">$0.00</p>
            <p className="text-sm text-muted-foreground">por 1000 correções</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-card-foreground">Nota Média</h3>
            <p className="text-4xl font-bold text-foreground">0.0/10</p>
            <p className="text-sm text-muted-foreground">geral</p>
          </div>
        </div>
      </div>
    </div>
  )
}
