import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { Textarea } from '@/components/ui/textarea'
import { GrammarAnalysisResult } from '@/lib/langchain/agents/grammar-analysis-agent'
import { toast } from 'sonner'
import { GrammarReviewService } from '@/lib/services/grammar-review-service'

interface GrammarReviewProps {
  correctionId: string
  analysis: GrammarAnalysisResult
  text: string
  onRequestNewAnalysis: () => void
  hideTextDisplay?: boolean
}

export function GrammarReview({ 
  correctionId, 
  analysis, 
  text, 
  onRequestNewAnalysis,
  hideTextDisplay = false 
}: GrammarReviewProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  // Função para marcar os erros no texto
  const getHighlightedText = () => {
    let highlightedText = text
    const sortedErrors = [...analysis.errors].sort((a, b) => {
      return b.error.length - a.error.length // Ordena do maior para o menor para evitar sobreposição
    })

    sortedErrors.forEach(error => {
      const errorHtml = `<mark class="bg-yellow-200 cursor-help" title="${error.explanation}">${error.error}</mark>`
      highlightedText = highlightedText.replace(error.error, errorHtml)
    })

    return highlightedText
  }

  // Salvar avaliação usando o serviço
  const handleSaveReview = async () => {
    if (rating === 0) {
      toast.error('Por favor, selecione uma avaliação entre 1 e 5 estrelas')
      return
    }

    setIsSaving(true)
    try {
      const { success, error } = await GrammarReviewService.saveReview({
        correctionId,
        rating,
        feedback,
        totalErrors: analysis.summary.totalErrors,
        qualityScore: analysis.summary.readabilityScore,
        analysis
      })

      if (!success) {
        throw error
      }

      toast.success('Avaliação salva com sucesso!')
      setHasReviewed(true)
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      toast.error('Erro ao salvar avaliação: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Texto com Marcações - apenas se não estiver sendo escondido */}
      {!hideTextDisplay && (
        <Card>
          <CardHeader>
            <CardTitle>Texto Analisado</CardTitle>
            <CardDescription>
              Passe o mouse sobre as marcações para ver as explicações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
            />
          </CardContent>
        </Card>
      )}

      {/* Resumo dos Erros */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Total</Badge>
              <p className="text-2xl font-bold">{analysis.summary.totalErrors}</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Gramática</Badge>
              <p className="text-2xl font-bold">{analysis.summary.grammarErrors}</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Ortografia</Badge>
              <p className="text-2xl font-bold">{analysis.summary.spellingErrors}</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Pontuação</Badge>
              <p className="text-2xl font-bold">{analysis.summary.punctuationErrors}</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-2">Qualidade Geral</h4>
            <Badge 
              variant={
                analysis.summary.overallQuality === 'excelente' ? 'default' :
                analysis.summary.overallQuality === 'bom' ? 'secondary' :
                analysis.summary.overallQuality === 'regular' ? 'outline' :
                'destructive'
              }
            >
              {analysis.summary.overallQuality}
            </Badge>
            <span className="ml-2 text-sm font-medium">
              (Nota: {analysis.summary.readabilityScore.toFixed(1)}/10)
            </span>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-2">Sugestões de Melhoria</h4>
            <ul className="list-disc pl-4 space-y-2">
              {analysis.summary.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Lista Detalhada de Erros */}
      <Card>
        <CardHeader>
          <CardTitle>Erros Encontrados</CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.errors.length === 0 ? (
            <p className="text-center py-6 text-green-500 font-medium">
              Nenhum erro encontrado no texto!
            </p>
          ) : (
            <div className="space-y-4">
              {analysis.errors.map((error, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{error.type}</Badge>
                    <Badge variant="outline">{error.severity}</Badge>
                  </div>
                  <p className="text-red-500 line-through mb-1">{error.error}</p>
                  <p className="text-green-500 mb-2">{error.correction}</p>
                  <p className="text-sm text-muted-foreground">{error.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avaliação da Correção */}
      {!hasReviewed ? (
        <Card>
          <CardHeader>
            <CardTitle>Avalie esta Correção</CardTitle>
            <CardDescription>
              Sua avaliação nos ajuda a melhorar a qualidade das correções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Qualidade da Análise
                </label>
                <StarRating
                  value={rating}
                  onChange={setRating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione de 1 a 5 estrelas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Feedback Adicional
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Compartilhe sua opinião sobre a qualidade desta correção..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={onRequestNewAnalysis}
                >
                  Solicitar Nova Análise
                </Button>
                <Button
                  onClick={handleSaveReview}
                  disabled={rating === 0 || isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Avaliação'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Avaliação Enviada</CardTitle>
            <CardDescription>
              Obrigado pelo seu feedback!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={onRequestNewAnalysis}
              >
                Solicitar Nova Análise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 