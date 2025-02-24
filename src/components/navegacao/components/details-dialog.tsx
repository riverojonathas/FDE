'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ItemHierarquico } from "@/types/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DetailsDialogProps {
  item: ItemHierarquico
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DetailsDialog({ item, open, onOpenChange }: DetailsDialogProps) {
  const renderDetalhesCompletos = () => {
    switch (item.tipo) {
      case 'escola':
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Informações Gerais</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Total de Turmas:</div>
                  <div>30</div>
                  <div className="text-muted-foreground">Total de Alunos:</div>
                  <div>900</div>
                  <div className="text-muted-foreground">Cidade:</div>
                  <div>Ribeirão Preto</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Grade de Turmas</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Ensino Fundamental</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>6º Ano: 3 turmas</div>
                      <div>7º Ano: 3 turmas</div>
                      <div>8º Ano: 3 turmas</div>
                      <div>9º Ano: 3 turmas</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">Ensino Médio</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>1º Ano: 3 turmas</div>
                      <div>2º Ano: 3 turmas</div>
                      <div>3º Ano: 3 turmas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'tipo-ensino':
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Informações do Nível</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Total de Séries:</div>
                  <div>4</div>
                  <div className="text-muted-foreground">Total de Turmas:</div>
                  <div>12</div>
                  <div className="text-muted-foreground">Total de Alunos:</div>
                  <div>360</div>
                </div>
              </div>
            </div>
          </div>
        )

      // Adicione mais casos conforme necessário
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.nome}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[600px] pr-4">
          {renderDetalhesCompletos()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 