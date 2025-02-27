'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Clock, ArrowUpRight, FileQuestion, User, BookOpen } from "lucide-react"
import { useCorrectionStore } from "@/store/correction-store"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function CorrectionHistory() {
  const { correctionHistory, setCurrentResult } = useCorrectionStore()

  const handleViewCorrection = (index: number) => {
    setCurrentResult(correctionHistory[index])
  }

  if (!correctionHistory.length) {
    return (
      <Card className="min-h-[500px]">
        <CardHeader>
          <CardTitle>Histórico de Correções</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhuma correção realizada</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              O histórico de correções será exibido aqui após a análise de textos.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="min-h-[500px]">
      <CardHeader>
        <CardTitle>Histórico de Correções</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {correctionHistory.map((correction, index) => {
              // Data formatada
              const formattedDate = correction.metadata.analyzedAt
                ? formatDistanceToNow(new Date(correction.metadata.analyzedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })
                : "Data desconhecida"
                
              // Determina o ícone de status
              let StatusIcon
              let statusColor
              
              switch (correction.status) {
                case "approved":
                  StatusIcon = CheckCircle
                  statusColor = "text-green-500"
                  break
                case "rejected":
                  StatusIcon = XCircle
                  statusColor = "text-red-500"
                  break
                default:
                  StatusIcon = AlertCircle
                  statusColor = "text-amber-500"
              }
              
              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <StatusIcon className={`h-5 w-5 ${statusColor} mt-0.5`} />
                    <div>
                      <div className="font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                        {correction.metadata.name ? (
                          <>
                            <span>{correction.metadata.name}</span>
                            {correction.metadata.id && (
                              <span className="text-xs text-muted-foreground">
                                ({correction.metadata.id})
                              </span>
                            )}
                          </>
                        ) : (
                          <span>Correção #{index + 1}</span>
                        )}
                        <span className="text-muted-foreground text-sm font-normal">
                          {formattedDate}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mt-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          {correction.metadata.class && (
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              Turma: {correction.metadata.class}
                            </span>
                          )}
                          
                          {correction.metadata.id && (
                            <span className="inline-flex items-center gap-1">
                              <FileQuestion className="h-3.5 w-3.5" />
                              {correction.metadata.id}
                              {correction.metadata.type && (
                                <span className="text-xs text-muted-foreground/70 ml-1">
                                  ({correction.metadata.type})
                                </span>
                              )}
                            </span>
                          )}
                          
                          {correction.metadata.subject && (
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              {correction.metadata.subject.charAt(0).toUpperCase() + 
                               correction.metadata.subject.slice(1)}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1">
                            <span>{correction.metadata.wordCount} palavras</span>
                            <span className="text-muted-foreground/40">•</span>
                            <span>{correction.metadata.paragraphCount} parágrafos</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <Badge 
                      variant={
                        correction.status === "approved" 
                          ? "success" 
                          : correction.status === "review" 
                            ? "warning" 
                            : "destructive"
                      }
                    >
                      {correction.score.toFixed(1)}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewCorrection(index)}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 