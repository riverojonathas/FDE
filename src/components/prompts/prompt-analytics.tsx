'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  BarChart, 
  DonutChart 
} from "@tremor/react"
import { useAppStore } from "@/store/useAppStore"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export function PromptAnalytics() {
  const { prompts, corrections } = useAppStore()
  
  return (
    <div className="grid gap-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Média de Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5</div>
            <p className="text-xs text-muted-foreground">
              Baseado em 1,234 correções
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Tempo Médio de Correção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45s</div>
            <p className="text-xs text-muted-foreground">
              Por resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Taxa de Concordância
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              Com correções manuais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={[
                { nota: "0-2", quantidade: 50 },
                { nota: "2-4", quantidade: 150 },
                { nota: "4-6", quantidade: 300 },
                { nota: "6-8", quantidade: 450 },
                { nota: "8-10", quantidade: 250 },
              ]}
              index="nota"
              categories={["quantidade"]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução da Precisão</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={[
                { data: "Jan", precisao: 85 },
                { data: "Fev", precisao: 87 },
                { data: "Mar", precisao: 89 },
                { data: "Abr", precisao: 88 },
                { data: "Mai", precisao: 91 },
              ]}
              index="data"
              categories={["precisao"]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {prompts.map(prompt => (
                <div key={prompt.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prompt.title}</h4>
                    <Badge>v{prompt.version}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {prompt.content}
                  </p>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Performance: </span>
                    <span className="font-medium">92% de precisão</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 