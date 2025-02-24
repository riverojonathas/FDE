'use client'

import { PageHeader } from "@/components/ui/page-header"
import { PromptAnalytics } from "@/components/prompts/prompt-analytics"
import { PromptCalibration } from "@/components/prompts/prompt-calibration"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PromptsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="Calibração de Prompts"
        description="Analise e aprimore os prompts de correção para melhorar a precisão das avaliações"
      />

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Análise de Resultados</TabsTrigger>
          <TabsTrigger value="calibration">Calibração</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <PromptAnalytics />
        </TabsContent>

        <TabsContent value="calibration">
          <PromptCalibration />
        </TabsContent>
      </Tabs>
    </div>
  )
} 