'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CorrectionSettings() {
  return (
    <div className="space-y-6">
      {/* Configurações de Análise */}
      <Card>
        <CardHeader>
          <CardTitle>Etapas de Análise</CardTitle>
          <CardDescription>
            Configure quais aspectos devem ser analisados durante a correção.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="grammar">Análise Gramatical</Label>
            <Switch id="grammar" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="coherence">Coerência e Coesão</Label>
            <Switch id="coherence" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="theme">Desenvolvimento do Tema</Label>
            <Switch id="theme" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Nota */}
      <Card>
        <CardHeader>
          <CardTitle>Cálculo da Nota</CardTitle>
          <CardDescription>
            Configure os pesos e critérios para o cálculo da nota final.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pesos dos Critérios */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Peso da Gramática (30%)</Label>
              <Slider defaultValue={[30]} max={100} step={5} />
            </div>
            <div className="space-y-2">
              <Label>Peso da Coerência (40%)</Label>
              <Slider defaultValue={[40]} max={100} step={5} />
            </div>
            <div className="space-y-2">
              <Label>Peso do Tema (30%)</Label>
              <Slider defaultValue={[30]} max={100} step={5} />
            </div>
          </div>

          {/* Nota Mínima */}
          <div className="space-y-2">
            <Label>Nota Mínima para Aprovação</Label>
            <Input type="number" placeholder="5.0" min={0} max={10} step={0.5} />
          </div>

          {/* Penalizações */}
          <div className="space-y-2">
            <Label>Penalizações</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="plagiarism-penalty">Plágio</Label>
                <Input 
                  id="plagiarism-penalty"
                  type="number" 
                  className="w-20" 
                  placeholder="-2.0"
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="ai-penalty">Uso de IA</Label>
                <Input 
                  id="ai-penalty"
                  type="number" 
                  className="w-20" 
                  placeholder="-1.0"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Detecção */}
      <Card>
        <CardHeader>
          <CardTitle>Detecção de Plágio e Fraude</CardTitle>
          <CardDescription>
            Configure as verificações de integridade acadêmica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="plagiarism">Detecção de Plágio</Label>
            <Switch id="plagiarism" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="ai-detection">Detecção de Uso de IA</Label>
            <Switch id="ai-detection" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="similarity">Verificação de Similaridade</Label>
            <Switch id="similarity" defaultChecked />
          </div>

          {/* Configurações Avançadas */}
          <div className="space-y-2 mt-4">
            <Label>Limiar de Similaridade</Label>
            <div className="flex items-center gap-4">
              <Slider defaultValue={[70]} max={100} step={5} className="flex-1" />
              <span className="text-sm">70%</span>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Respostas com similaridade acima do limiar serão marcadas para revisão manual.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Configurações de Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Feedback</CardTitle>
          <CardDescription>
            Personalize como o feedback será apresentado ao aluno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="examples">Incluir Exemplos</Label>
            <Switch id="examples" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="suggestions">Sugestões de Melhoria</Label>
            <Switch id="suggestions" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="references">Referências</Label>
            <Switch id="references" />
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Restaurar Padrões</Button>
        <Button>Salvar Configurações</Button>
      </div>
    </div>
  )
} 