'use client'

import { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sliders } from 'lucide-react'

interface AgentConfigurationModalProps {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  basicConfig: ReactNode
  advancedConfig?: ReactNode
  additionalTabs?: {
    id: string
    label: string
    content: ReactNode
  }[]
}

/**
 * Componente modal base para configuração de agentes
 * Fornece estrutura padronizada com abas para configurações básicas e avançadas
 */
export function AgentConfigurationModal({
  title,
  open,
  onOpenChange,
  basicConfig,
  advancedConfig,
  additionalTabs = []
}: AgentConfigurationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Sliders className="h-4 w-4" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className={`grid grid-cols-${2 + additionalTabs.length}`}>
            <TabsTrigger value="basic">Configurações Básicas</TabsTrigger>
            {advancedConfig && (
              <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
            )}
            {additionalTabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
          
          {/* Configurações Básicas */}
          <TabsContent value="basic" className="space-y-6 pt-4">
            {basicConfig}
          </TabsContent>
          
          {/* Configurações Avançadas */}
          {advancedConfig && (
            <TabsContent value="advanced" className="space-y-6 pt-4">
              {advancedConfig}
            </TabsContent>
          )}
          
          {/* Abas adicionais */}
          {additionalTabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6 pt-4">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 