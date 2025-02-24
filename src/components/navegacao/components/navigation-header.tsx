import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NavigationLevel } from '@/types/navigation';

interface NavigationHeaderProps {
  currentLevel: NavigationLevel;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const getLevelLabel = (level: NavigationLevel) => {
  const labels: Record<NavigationLevel, string> = {
    cidade: 'Cidades',
    escola: 'Escolas',
    'tipo-ensino': 'Tipos de Ensino',
    serie: 'Séries',
    turma: 'Turmas',
    professor: 'Professores',
    aluno: 'Alunos'
  };
  return labels[level];
};

export function NavigationHeader({ currentLevel, searchTerm, onSearchChange }: NavigationHeaderProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        {getLevelLabel(currentLevel)}
      </h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`Pesquisar ${getLevelLabel(currentLevel).toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
} 