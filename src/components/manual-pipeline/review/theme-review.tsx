'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Tag, MessageSquare, Lightbulb, FileText, AlertTriangle, CheckCircle2, ThumbsUp, BookOpen, PenLine, GitBranch } from 'lucide-react'
import { ThemeAnalysisResult } from '../steps/theme-analysis'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

// Interface genérica para aceitar diferentes formatos
interface ThemeReviewProps {
  correctionId: string
  analysis: ThemeAnalysisResult
  text: string
  onRequestNewAnalysis?: () => void // Tornando opcional
  hideTextDisplay?: boolean
}

// Interface para os dados normalizados usados internamente
interface NormalizedThemeData {
  theme: {
    main: string
    development: string
    relevance: string
    subthemes: string[]
  }
  argument: {
    quality: string
    evidence: string
    reasoning: string
    fallacies: string[]
  } | null
  scores: {
    adherence: number
    relevance: number
    overall: number
  }
  recommendations: string[]
}

/**
 * Componente para exibir os resultados da análise temática
 */
export function ThemeReview({
  correctionId,
  analysis,
  text,
  onRequestNewAnalysis,
  hideTextDisplay = false
}: ThemeReviewProps) {
  const [isSaving, setIsSaving] = useState(false)
  
  // Função para salvar a avaliação
  const saveEvaluation = async (agree: boolean) => {
    setIsSaving(true)
    
    try {
      const { error } = await supabase.from('theme_reviews').upsert({
        correction_id: correctionId,
        review_date: new Date().toISOString(),
        teacher_agrees: agree,
        teacher_comments: '',
        analysis_data: analysis
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      toast.success('Avaliação salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      toast.error('Erro ao salvar avaliação. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  // Função para normalizar os dados de análise (compatível com diferentes formatos)
  const normalizeAnalysis = (): NormalizedThemeData => {
    console.log('Normalizando análise, formato recebido:', typeof analysis);
    
    // Se a análise for uma string, tentar fazer parse para objeto
    let processedAnalysis = analysis;
    if (typeof analysis === 'string') {
      try {
        processedAnalysis = JSON.parse(analysis);
        console.log('Convertido de string para objeto');
      } catch (e) {
        console.error('Falha ao converter string para objeto JSON:', e);
        // Continuar com a string original
      }
    }
    
    // Formato como definido no componente ThemeAnalysis
    if (processedAnalysis && processedAnalysis.thematicAnalysis) {
      console.log('Formato ThemeAnalysis detectado');
      return {
        theme: {
          main: processedAnalysis.thematicAnalysis.mainTheme || 'Não especificado',
          development: processedAnalysis.thematicAnalysis.themeDevelopment || 'Não especificado',
          relevance: processedAnalysis.thematicAnalysis.relevance || 'Não avaliado',
          subthemes: Array.isArray(processedAnalysis.thematicAnalysis.subthemes) ? 
            processedAnalysis.thematicAnalysis.subthemes : []
        },
        argument: processedAnalysis.argumentativeAnalysis ? {
          quality: processedAnalysis.argumentativeAnalysis.argumentQuality || 'Não avaliado',
          evidence: processedAnalysis.argumentativeAnalysis.evidenceUse || 'Não avaliado',
          reasoning: processedAnalysis.argumentativeAnalysis.reasoning || 'Não avaliado',
          fallacies: Array.isArray(processedAnalysis.argumentativeAnalysis.fallacies) ? 
            processedAnalysis.argumentativeAnalysis.fallacies : []
        } : null,
        scores: {
          adherence: typeof processedAnalysis.adherenceScore === 'number' ? processedAnalysis.adherenceScore : 0,
          relevance: typeof processedAnalysis.relevanceScore === 'number' ? processedAnalysis.relevanceScore : 0,
          overall: typeof processedAnalysis.overallScore === 'number' ? processedAnalysis.overallScore : 0
        },
        recommendations: Array.isArray(processedAnalysis.recommendations) ? 
          processedAnalysis.recommendations : []
      };
    }
    // Formato como definido em types/pipeline.ts
    else if (processedAnalysis && processedAnalysis.content) {
      console.log('Formato pipeline.ts detectado');
      return {
        theme: {
          main: processedAnalysis.keypoints?.mainIdea || 'Não identificado',
          development: processedAnalysis.content.comments || 'Não especificado',
          relevance: processedAnalysis.content.relevance >= 7 ? 'Alta' : 
                    (processedAnalysis.content.relevance >= 5 ? 'Média' : 'Baixa'),
          subthemes: Array.isArray(processedAnalysis.keypoints?.supportingPoints) ? 
            processedAnalysis.keypoints.supportingPoints : []
        },
        argument: {
          quality: 'Não avaliado',
          evidence: 'Não avaliado',
          reasoning: 'Não avaliado',
          fallacies: []
        },
        scores: {
          adherence: typeof processedAnalysis.content.adherence === 'number' ? 
            processedAnalysis.content.adherence : 0,
          relevance: typeof processedAnalysis.content.relevance === 'number' ? 
            processedAnalysis.content.relevance : 0,
          overall: typeof processedAnalysis.overall?.score === 'number' ? 
            processedAnalysis.overall.score : 0
        },
        recommendations: Array.isArray(processedAnalysis.overall?.recommendations) ? 
          processedAnalysis.overall.recommendations : []
      };
    }
    // Fallback - tentar extrair o que for possível
    else {
      console.warn('Formato desconhecido, usando fallback:', processedAnalysis);
      
      // Tentar encontrar props relevantes em qualquer lugar do objeto
      const findProp = (obj: any, keys: string[]): any => {
        if (!obj || typeof obj !== 'object') return undefined;
        
        for (const key of keys) {
          if (key in obj) return obj[key];
        }
        
        // Procurar recursivamente em subpropriedades
        for (const prop in obj) {
          if (typeof obj[prop] === 'object') {
            const result = findProp(obj[prop], keys);
            if (result !== undefined) return result;
          }
        }
        
        return undefined;
      };
      
      return {
        theme: {
          main: findProp(processedAnalysis, ['mainTheme', 'theme', 'mainIdea', 'topic']) || 'Não disponível',
          development: findProp(processedAnalysis, ['themeDevelopment', 'development', 'analysis']) || 'Não disponível',
          relevance: findProp(processedAnalysis, ['relevance', 'relevância']) || 'Não avaliado',
          subthemes: Array.isArray(findProp(processedAnalysis, ['subthemes', 'subtemas'])) ? 
            findProp(processedAnalysis, ['subthemes', 'subtemas']) : []
        },
        argument: null,
        scores: {
          adherence: typeof findProp(processedAnalysis, ['adherenceScore', 'adherence', 'aderência']) === 'number' ? 
            findProp(processedAnalysis, ['adherenceScore', 'adherence', 'aderência']) : 0,
          relevance: typeof findProp(processedAnalysis, ['relevanceScore', 'relevance', 'relevância']) === 'number' ? 
            findProp(processedAnalysis, ['relevanceScore', 'relevance', 'relevância']) : 0,
          overall: typeof findProp(processedAnalysis, ['overallScore', 'overall', 'score', 'nota']) === 'number' ? 
            findProp(processedAnalysis, ['overallScore', 'overall', 'score', 'nota']) : 0
        },
        recommendations: Array.isArray(findProp(processedAnalysis, ['recommendations', 'recomendações'])) ? 
          findProp(processedAnalysis, ['recommendations', 'recomendações']) : []
      };
    }
  };

  const data = normalizeAnalysis();

  // Funções auxiliares para visualização
  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getProgressColor = (score: number): string => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRelevanceBadge = (relevance: string): React.ReactNode => {
    switch (relevance) {
      case 'Alta':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Alta</Badge>;
      case 'Média':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Média</Badge>;
      case 'Baixa':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Baixa</Badge>;
      default:
        return <Badge variant="outline">Não avaliado</Badge>;
    }
  };

  const getQualityBadge = (quality: string): React.ReactNode => {
    switch (quality) {
      case 'Excelente':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Excelente</Badge>;
      case 'Boa':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Boa</Badge>;
      case 'Regular':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Regular</Badge>;
      case 'Insuficiente':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Insuficiente</Badge>;
      default:
        return <Badge variant="outline">Não avaliado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo da análise */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aderência ao Tema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <span className={`text-4xl font-bold ${getScoreColor(data.scores.adherence)}`}>
                {data.scores.adherence.toFixed(1)}
              </span>
              <span className="text-2xl">/10</span>
              <Progress 
                value={data.scores.adherence * 10} 
                className={`mt-2 ${getProgressColor(data.scores.adherence)}`}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relevância</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <span className={`text-4xl font-bold ${getScoreColor(data.scores.relevance)}`}>
                {data.scores.relevance.toFixed(1)}
              </span>
              <span className="text-2xl">/10</span>
              <Progress 
                value={data.scores.relevance * 10} 
                className={`mt-2 ${getProgressColor(data.scores.relevance)}`}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nota Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <span className={`text-4xl font-bold ${getScoreColor(data.scores.overall)}`}>
                {data.scores.overall.toFixed(1)}
              </span>
              <span className="text-2xl">/10</span>
              <Progress 
                value={data.scores.overall * 10} 
                className={`mt-2 ${getProgressColor(data.scores.overall)}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Análise temática */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise Temática</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">Tema Principal</h3>
              </div>
              <p className="text-sm pl-7">{data.theme.main}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PenLine className="h-5 w-5 text-violet-500" />
                <h3 className="font-medium">Desenvolvimento do Tema</h3>
                {getRelevanceBadge(data.theme.relevance)}
              </div>
              <p className="text-sm pl-7">{data.theme.development}</p>
            </div>
            
            {data.theme.subthemes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Subtemas Identificados</h3>
                </div>
                <ul className="list-disc pl-10 text-sm space-y-1">
                  {data.theme.subthemes.map((subtheme: string, index: number) => (
                    <li key={index}>{subtheme}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Análise argumentativa (se disponível) */}
      {data.argument && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análise Argumentativa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Qualidade da Argumentação</h3>
                {getQualityBadge(data.argument.quality)}
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Uso de Evidências</h3>
                <p className="text-sm">{data.argument.evidence}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Linha de Raciocínio</h3>
                <p className="text-sm">{data.argument.reasoning}</p>
              </div>
              
              {data.argument.fallacies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <h3 className="font-medium">Falácias Identificadas</h3>
                  </div>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    {data.argument.fallacies.map((fallacy: string, index: number) => (
                      <li key={index} className="text-orange-700">{fallacy}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recomendações */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recomendações de Melhoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <ThumbsUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Texto analisado (se não estiver oculto) */}
      {!hideTextDisplay && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Texto Analisado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{text}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Botão para nova análise */}
      {onRequestNewAnalysis && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onRequestNewAnalysis}>
            Solicitar Nova Análise
          </Button>
        </div>
      )}
      
      <CardFooter className="flex justify-between pt-6">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => saveEvaluation(false)}
            disabled={isSaving}
          >
            Discordo
          </Button>
          <Button 
            onClick={() => saveEvaluation(true)}
            disabled={isSaving}
          >
            Concordo
          </Button>
        </div>
      </CardFooter>
    </div>
  )
} 