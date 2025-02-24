'use client'

import { useState, useEffect } from 'react'
import { Building2, School, GraduationCap, BookOpen, Users, Search, Eye } from 'lucide-react'
import { NavigationBreadcrumb } from './navigation-breadcrumb'
import { SelectionCard } from './selection-card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NavigationState, NavigationData } from '@/types/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import { cidades } from '@/data/cidades'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/use-toast'
import { City, School as SchoolType, Grade, TeacherSchoolSubject, StudentClass, ItemHierarquico, ItemSelecionado, ItemTipo } from '@/types/navigation'
import { LucideIcon } from 'lucide-react'
import { ListCard } from './components/list-card'
import { testConnection, checkCitiesData } from '@/lib/supabase'
import { formatarItens, formatarItensUnicos } from '@/types/navigation'
import { ViewSelector } from './components/view-selector'
import { StudentCard } from './components/student-card'
import { NavigationItemCard } from './components/navigation-item-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const niveisNavegacao = [
  { id: 'cidade', rotulo: 'Cidade', icone: Building2 },
  { id: 'escola', rotulo: 'Escola', icone: School },
  { id: 'tipo-ensino', rotulo: 'Tipo de Ensino', icone: GraduationCap },
  { id: 'serie', rotulo: 'Série', icone: BookOpen },
  { id: 'turma', rotulo: 'Turma', icone: Users },
  { id: 'aluno', rotulo: 'Aluno', icone: Users },
  { id: 'professor', rotulo: 'Professor', icone: Users }
] as const;

// Estado inicial para os itens selecionados
const initialSelectedItems: NavigationState = {
  'cidade': null,
  'escola': null,
  'tipo-ensino': null,
  'serie': null,
  'turma': null,
  'aluno': null,
  'professor': null
};

interface GradeWithEducationLevel {
  id: string;
  name: string;
  education_levels: {
    id: string;
    name: string;
  }[];
}

interface DatabaseSchema {
  cities: {
    id: string;
    name: string;
    state: string;
  };
  schools: {
    id: string;
    name: string;
    city_id: string;
    type: string;
  };
  education_levels: {
    id: string;
    name: string;
  };
  grades: {
    id: string;
    name: string;
    education_level_id: string;
  };
  classes: {
    id: string;
    name: string;
    grade_id: string;
    year: number;
  };
  students: {
    id: string;
    name: string;
    email: string;
    school_id: string;
    grade_id: string;
  };
}

interface ItemProps {
  title: string
  subtitle: string
}

function Item({ title, subtitle }: ItemProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer group">
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-100">{title}</h3>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-slate-400 hover:text-slate-100"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

export function NavegacaoHierarquica() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-100 flex items-center gap-2">
            Cidade
            <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded">
              5 itens
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Item title="Campinas" subtitle="Campinas - SP" />
          <Item title="Ribeirão Preto" subtitle="Ribeirão Preto - SP" />
          <Item title="Santos" subtitle="Santos - SP" />
          <Item title="São José dos Campos" subtitle="São José dos Campos - SP" />
          <Item title="São Paulo" subtitle="São Paulo - SP" />
        </div>
      </div>
    </div>
  )
} 