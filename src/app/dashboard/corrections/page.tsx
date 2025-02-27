'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  FileText, 
  Filter, 
  MoreHorizontal, 
  RefreshCw, 
  Search, 
  SlidersHorizontal 
} from 'lucide-react'
import { CorrectionData } from '@/lib/supabase/client'

// Componente para exibir paginação
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages || 1}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

// Componente principal da página
export default function CorrectionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Estados para filtros e paginação
  const [corrections, setCorrections] = useState<CorrectionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reviewFilter, setReviewFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  
  useEffect(() => {
    // Obter parâmetros da URL
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') || 'all'
    const review = searchParams.get('review') || 'all'
    const date = searchParams.get('date') || 'all'
    const search = searchParams.get('search') || ''
    
    // Atualizar estados com os parâmetros da URL
    setCurrentPage(page)
    setStatusFilter(status)
    setReviewFilter(review)
    setDateFilter(date)
    setSearchTerm(search)
    
    fetchCorrections(page, status, review, date, search)
  }, [searchParams])
  
  // Função para buscar as correções
  const fetchCorrections = async (
    page = currentPage,
    status = statusFilter,
    review = reviewFilter,
    date = dateFilter,
    search = searchTerm
  ) => {
    setLoading(true)
    setError('')
    
    try {
      // Aqui fariamos uma chamada para a API
      // const response = await fetch(`/api/corrections?page=${page}&status=${status}&review=${review}&date=${date}&search=${search}&limit=${itemsPerPage}`)
      // const data = await response.json()
      
      // Simulação de dados
      setTimeout(() => {
        // Gerar dados de exemplo
        const exampleData = Array.from({ length: 10 }, (_, i) => ({
          id: `cor_${Date.now()}_${i}`,
          student_id: `student_${i % 5}`,
          question_id: `question_${i % 3}`,
          input: {
            text: `Texto da correção ${i + 1}`
          },
          result: {
            textAnalysis: {
              readabilityScore: 7 + Math.random() * 3
            },
            criteriaAnalysis: {
              overall: {
                score: 6 + Math.random() * 4
              }
            },
            plagiarismResult: {
              score: 8 + Math.random() * 2
            },
            feedback: {
              summary: `Feedback para a correção ${i + 1}`
            }
          },
          metadata: {
            student_id: `student_${i % 5}`,
            question_id: `question_${i % 3}`,
            created_at: new Date(Date.now() - i * 86400000).toISOString(),
            processing_time: 2 + Math.random() * 3,
            word_count: 150 + i * 20,
            version: '1.0.0',
            status: i % 5 === 0 ? 'error' : i % 3 === 0 ? 'partial' : 'complete'
          },
          human_review: i % 2 === 0 ? {
            reviewed: true,
            reviewedBy: `Professor ${i % 3}`,
            reviewedAt: new Date(Date.now() - i * 43200000).toISOString(),
            adjustedScore: 7.5 + Math.random(),
            comments: `Comentários da revisão ${i + 1}`,
            status: i % 3 === 0 ? 'rejected' : i % 2 === 0 ? 'adjusted' : 'approved'
          } : null,
          created_at: new Date(Date.now() - i * 86400000).toISOString(),
          updated_at: new Date(Date.now() - i * 43200000).toISOString(),
          reviewed_at: i % 2 === 0 ? new Date(Date.now() - i * 43200000).toISOString() : null,
          reviewed_by: i % 2 === 0 ? `usr_${i}` : null
        }))
        
        setCorrections(exampleData as CorrectionData[])
        setTotalItems(50) // Exemplo: 50 itens no total
        setLoading(false)
      }, 800)
      
    } catch (err) {
      console.error('Erro ao buscar correções:', err)
      setError('Não foi possível carregar as correções. Tente novamente mais tarde.')
      setLoading(false)
    }
  }
  
  // Função para aplicar filtros
  const applyFilters = () => {
    // Atualizar URL com os filtros
    const params = new URLSearchParams()
    params.set('page', '1') // Voltar para a primeira página ao aplicar filtros
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (reviewFilter !== 'all') params.set('review', reviewFilter)
    if (dateFilter !== 'all') params.set('date', dateFilter)
    if (searchTerm) params.set('search', searchTerm)
    
    router.push(`/dashboard/corrections?${params.toString()}`)
  }
  
  // Função para limpar filtros
  const clearFilters = () => {
    setStatusFilter('all')
    setReviewFilter('all')
    setDateFilter('all')
    setSearchTerm('')
    router.push('/dashboard/corrections')
  }
  
  // Função para mudar de página
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/dashboard/corrections?${params.toString()}`)
  }
  
  // Formatar data
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Obter nome do aluno (simulado)
  const getStudentName = (studentId: string) => {
    const studentNames: Record<string, string> = {
      'student_0': 'Ana Silva',
      'student_1': 'João Oliveira',
      'student_2': 'Pedro Santos',
      'student_3': 'Carla Pereira',
      'student_4': 'Mariana Costa'
    }
    
    return studentNames[studentId] || 'Aluno Desconhecido'
  }
  
  // Obter nome da questão (simulado)
  const getQuestionTitle = (questionId: string) => {
    const questionTitles: Record<string, string> = {
      'question_0': 'Redação ENEM: Educação Digital',
      'question_1': 'Dissertação: Desafios Ambientais',
      'question_2': 'Argumentativa: Ética na IA'
    }
    
    return questionTitles[questionId] || 'Questão Desconhecida'
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Correções</h1>
          <p className="text-muted-foreground">
            Gerencie e visualize todas as correções
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchCorrections()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Nova Correção
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Refine os resultados usando os filtros abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="complete">Completo</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={reviewFilter} onValueChange={setReviewFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Revisão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Revisões</SelectItem>
                <SelectItem value="reviewed">Revisados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
                <SelectItem value="adjusted">Ajustados</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer Data</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[40px] w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[52px] w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
          {error}
          <Button variant="outline" size="sm" className="ml-4" onClick={() => fetchCorrections()}>
            Tentar Novamente
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Aluno</TableHead>
                  <TableHead className="w-[250px]">Questão</TableHead>
                  <TableHead className="w-[120px]">Pontuação</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px]">Revisão</TableHead>
                  <TableHead className="w-[180px]">Data</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {corrections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma correção encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  corrections.map((correction) => (
                    <TableRow key={correction.id}>
                      <TableCell>
                        {getStudentName(correction.metadata.student_id || '')}
                      </TableCell>
                      <TableCell>
                        {getQuestionTitle(correction.metadata.question_id || '')}
                      </TableCell>
                      <TableCell>
                        {correction.human_review?.adjustedScore ? (
                          <span className="font-medium">
                            {correction.human_review.adjustedScore.toFixed(1)}
                          </span>
                        ) : correction.result?.criteriaAnalysis?.overall?.score ? (
                          correction.result.criteriaAnalysis.overall.score.toFixed(1)
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            correction.metadata.status === 'complete' ? 'success' : 
                            correction.metadata.status === 'partial' ? 'warning' : 
                            'destructive'
                          }
                        >
                          {correction.metadata.status === 'complete' ? 'Completo' : 
                           correction.metadata.status === 'partial' ? 'Parcial' : 
                           'Erro'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {correction.human_review ? (
                          <Badge 
                            variant={
                              correction.human_review.status === 'approved' ? 'success' : 
                              correction.human_review.status === 'adjusted' ? 'warning' : 
                              'destructive'
                            }
                          >
                            {correction.human_review.status === 'approved' ? 'Aprovado' : 
                             correction.human_review.status === 'adjusted' ? 'Ajustado' : 
                             'Rejeitado'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(correction.created_at || '')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/corrections/${correction.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Exportar PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
} 