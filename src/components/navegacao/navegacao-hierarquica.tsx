'use client'

import { useState, useEffect } from 'react'
import { Building2, School, GraduationCap, BookOpen, Users, Search } from 'lucide-react'
import { NavigationBreadcrumb } from './navigation-breadcrumb'
import { SelectionCard } from './selection-card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NavigationState, NavigationData } from '@/types/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { ItemHierarquico, ItemTipo } from '@/types/navigation'
import { ListCard } from './components/list-card'
import { ViewSelector } from './components/view-selector'

// Importar as funções do Supabase
import { 
  fetchCidades, 
  fetchEscolas, 
  fetchTurmas, 
  fetchAlunos 
} from '@/lib/supabase'

const niveisNavegacao = [
  { id: 'cidade', rotulo: 'Cidade', icone: Building2 },
  { id: 'escola', rotulo: 'Escola', icone: School },
  { id: 'tipo-ensino', rotulo: 'Tipo de Ensino', icone: GraduationCap },
  { id: 'serie', rotulo: 'Série', icone: BookOpen },
  { id: 'turma', rotulo: 'Turma', icone: Users },
  { id: 'aluno', rotulo: 'Aluno', icone: Users }
] as const

export function NavegacaoHierarquica() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [itens, setItens] = useState<ItemHierarquico[]>([])
  const [nivelAtual, setNivelAtual] = useState<ItemTipo>('cidade')
  const [viewType, setViewType] = useState<'grid' | 'list' | 'table'>('grid')
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [itensSelecionados, setItensSelecionados] = useState<NavigationState>({
    cidade: null,
    escola: null,
    'tipo-ensino': null,
    serie: null,
    turma: null,
    aluno: null
  })

  useEffect(() => {
    carregarItens()
  }, [nivelAtual, itensSelecionados])

  async function carregarItens() {
    setLoading(true)
    try {
      let dados: any[] = []

      switch (nivelAtual) {
        case 'cidade':
          const { data: cidades } = await supabase
            .from('cities')
            .select('*')
            .order('name')

          dados = cidades?.map(cidade => ({
            id: cidade.id,
            nome: cidade.name,
            tipo: nivelAtual,
            descricao: cidade.state,
            totalAlunos: 0
          })) || []
          break

        case 'escola':
          if (itensSelecionados.cidade) {
            const { data: escolas } = await supabase
              .from('schools')
              .select('*')
              .eq('city_id', itensSelecionados.cidade.id)
              .order('name')

            dados = escolas?.map(escola => ({
              id: escola.id,
              nome: escola.name,
              tipo: nivelAtual,
              descricao: itensSelecionados.cidade?.nome,
              totalAlunos: 0
            })) || []
          }
          break

        case 'turma':
          if (itensSelecionados.serie) {
            const { data: turmas } = await supabase
              .from('classes')
              .select('*')
              .eq('grade_id', itensSelecionados.serie.id)
              .order('name')

            dados = turmas?.map(turma => ({
              id: turma.id,
              nome: turma.name,
              tipo: nivelAtual,
              descricao: turma.period || '',
              totalAlunos: 0
            })) || []
          }
          break

        case 'aluno':
          if (itensSelecionados.turma) {
            const { data: matriculas } = await supabase
              .from('student_class_enrollments')
              .select('student:students(*)')
              .eq('class_id', itensSelecionados.turma.id)
              .order('student(name)')

            dados = matriculas?.map(m => ({
              id: m.student.id,
              nome: m.student.name,
              tipo: nivelAtual,
              descricao: `RA: ${m.student.registration_number || ''}`,
              totalAlunos: 0
            })) || []
          }
          break
      }

      setItens(dados)

    } catch (error) {
      console.error('Erro ao carregar itens:', error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os itens. Tente novamente."
      })
    } finally {
      setLoading(false)
    }
  }

  function getTotalAlunos(item: any): number {
    switch (nivelAtual) {
      case 'cidade':
        return item.totalAlunos || 0
      case 'escola':
        return item.student_count?.count || 0
      case 'tipo-ensino':
        return item.grades?.reduce((acc: number, grade: any) => 
          acc + grade.classes.reduce((acc2: number, classe: any) => 
            acc2 + classe.students.count, 0), 0) || 0
      case 'serie':
        return item.classes?.reduce((acc: number, classe: any) => 
          acc + classe.students.count, 0) || 0
      case 'turma':
        return item.students?.count || 0
      default:
        return 0
    }
  }

  function getItemDescription(item: any): string {
    switch (nivelAtual) {
      case 'cidade':
        return `${item.state} - ${item.totalAlunos} alunos`
      case 'escola':
        return `${item.city?.name} - ${item.student_count?.count || 0} alunos`
      case 'tipo-ensino':
        const totalAlunos = getTotalAlunos(item)
        return `${totalAlunos} alunos`
      case 'serie':
        const alunosSerie = getTotalAlunos(item)
        return `${item.grade?.education_level?.name} - ${alunosSerie} alunos`
      case 'turma':
        return `${item.period} - ${item.students?.count || 0} alunos`
      case 'aluno':
        return `RA: ${item.registration_number || ''}`
      default:
        return ''
    }
  }

  const handleSelecao = (item: ItemHierarquico) => {
    setItensSelecionados(prev => ({
      ...prev,
      [nivelAtual]: item
    }))

    // Avança para o próximo nível
    const nivelAtualIndex = niveisNavegacao.findIndex(n => n.id === nivelAtual)
    if (nivelAtualIndex < niveisNavegacao.length - 1) {
      setNivelAtual(niveisNavegacao[nivelAtualIndex + 1].id as ItemTipo)
    }
  }

  // Filtra itens baseado no nível atual e pesquisa
  const itensAtuais = itens || []
  const itensFiltrados = itensAtuais.filter(item => 
    item.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-slate-100">
            {niveisNavegacao.find(n => n.id === nivelAtual)?.rotulo}
          </h2>
          <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded">
            {itensFiltrados.length} itens
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar..."
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700"
            />
          </div>
          <ViewSelector
            currentView={viewType}
            onViewChange={setViewType}
          />
        </div>
      </div>

      <NavigationBreadcrumb
        itensSelecionados={itensSelecionados}
        nivelAtual={nivelAtual}
        aoClicarNivel={setNivelAtual}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          itensFiltrados.map((item) => (
            <ListCard
              key={item.id}
              item={item}
              selected={itensSelecionados[nivelAtual]?.id === item.id}
              onSelect={() => handleSelecao(item)}
            />
          ))
        )}
      </div>
    </div>
  )
} 