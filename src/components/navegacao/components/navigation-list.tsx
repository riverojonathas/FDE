import { useEffect, useState } from 'react';
import { Building2, School, GraduationCap, BookOpen, Users, UserSquare2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ListCard } from './list-card';
import { NavigationLevel, NavigationState, BaseItem } from '@/types/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ItemTipo } from './navegacao-hierarquica';

interface NavigationListProps {
  level: ItemTipo;
  viewType: 'grid' | 'list' | 'table';
  searchTerm: string;
  selectedItems: {
    cidade: { id: string; nome: string; descricao?: string } | null;
    escola: { id: string; nome: string; descricao?: string } | null;
    'tipo-ensino': { id: string; nome: string; descricao?: string } | null;
    serie: { id: string; nome: string; descricao?: string } | null;
    turma: { id: string; nome: string; descricao?: string } | null;
    aluno: { id: string; nome: string; descricao?: string } | null;
  };
  onSelect: (item: { id: string; nome: string; descricao?: string }) => void;
}

const getTableName = (level: NavigationLevel): string => {
  const tables: Record<NavigationLevel, string> = {
    cidade: 'cities',
    escola: 'schools',
    'tipo-ensino': 'education_levels',
    serie: 'grades',
    turma: 'classes',
    professor: 'teachers',
    aluno: 'students'
  };
  return tables[level];
};

const getSelectQuery = (level: NavigationLevel): string => {
  switch (level) {
    case 'cidade':
      return '*';
    case 'escola':
      return '*, city:cities(name)';
    case 'tipo-ensino':
      return 'distinct education_levels(id, name, code)';
    case 'serie':
      return '*, education_level:education_levels(name)';
    case 'turma':
      return '*, grade:grades(name)';
    case 'professor':
      return '*, subjects(name)';
    case 'aluno':
      return '*';
    default:
      return '*';
  }
};

const getFilters = (level: NavigationLevel, state: NavigationState) => {
  switch (level) {
    case 'escola':
      return { city_id: state.cidade?.id };
    case 'serie':
      return { education_level_id: state.tipoEnsino?.id };
    case 'turma':
      return { grade_id: state.serie?.id };
    case 'professor':
      return { class_id: state.turma?.id };
    case 'aluno':
      return { class_id: state.turma?.id };
    default:
      return {};
  }
};

const getIcon = (level: NavigationLevel) => {
  const icons: Record<NavigationLevel, typeof Building2> = {
    cidade: Building2,
    escola: School,
    'tipo-ensino': GraduationCap,
    serie: BookOpen,
    turma: Users,
    professor: UserSquare2,
    aluno: Users
  };
  return icons[level];
};

export function NavigationList({
  level,
  viewType,
  searchTerm,
  selectedItems,
  onSelect
}: NavigationListProps) {
  const [items, setItems] = useState<BaseItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, [level, selectedItems]);

  async function loadItems() {
    setLoading(true);
    try {
      if (level === 'tipo-ensino') {
        const { data, error } = await supabase
          .from('grades')
          .select(`
            education_levels (
              id,
              name
            )
          `)
          .eq('education_level_id', selectedItems.escola?.id);

        if (error) throw error;

        const tiposEnsinoUnicos = data.reduce<Record<string, BaseItem>>((acc, curr) => {
          const educationLevel = curr.education_levels;
          if (educationLevel && !acc[educationLevel.id]) {
            acc[educationLevel.id] = {
              id: educationLevel.id,
              name: educationLevel.name
            };
          }
          return acc;
        }, {});

        setItems(Object.values(tiposEnsinoUnicos));
      } else {
        const { data, error } = await supabase
          .from(getTableName(level))
          .select(getSelectQuery(level))
          .match(getFilters(level, selectedItems));

        if (error) throw error;
        setItems(data);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredItems.map(item => (
        <ListCard
          key={item.id}
          title={item.name}
          description={getItemDescription(item, level)}
          icon={getIcon(level)}
          selected={selectedItems[level]?.id === item.id}
          onClick={() => onSelect(item)}
        />
      ))}
      {filteredItems.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground">
          Nenhum item encontrado
        </div>
      )}
    </div>
  );
}

function getItemDescription(item: any, level: NavigationLevel): string {
  switch (level) {
    case 'cidade':
      return `${item.state}`;
    case 'escola':
      return `${item.type === 'public' ? 'Escola Pública' : 'Escola Particular'} - ${item.city?.name}`;
    case 'tipo-ensino':
      return item.code === 'EF' ? 'Ensino Fundamental' : 'Ensino Médio';
    case 'serie':
      return `${item.education_level?.name}`;
    case 'turma':
      return `${item.grade?.name} - ${item.period}`;
    case 'professor':
      return `${item.subjects?.map((s: any) => s.name).join(', ')}`;
    case 'aluno':
      return item.email;
    default:
      return '';
  }
} 