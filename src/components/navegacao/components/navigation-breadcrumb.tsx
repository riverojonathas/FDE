import { ChevronRight } from 'lucide-react';
import { NavigationLevel, NavigationState } from '@/types/navigation';

interface NavigationBreadcrumbProps {
  state: NavigationState;
  currentLevel: NavigationLevel;
  onLevelClick: (level: NavigationLevel) => void;
}

const getLevelLabel = (level: NavigationLevel): string => {
  const labels: Record<NavigationLevel, string> = {
    cidade: 'Cidade',
    escola: 'Escola',
    'tipo-ensino': 'Tipo de Ensino',
    serie: 'Série',
    turma: 'Turma',
    professor: 'Professor',
    aluno: 'Aluno'
  };
  return labels[level];
};

export function NavigationBreadcrumb({ state, currentLevel, onLevelClick }: NavigationBreadcrumbProps) {
  const levels: NavigationLevel[] = ['cidade', 'escola', 'tipo-ensino', 'serie', 'turma', 'professor', 'aluno'];
  const currentIndex = levels.indexOf(currentLevel);

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {levels.slice(0, currentIndex + 1).map((level, index) => {
        const isLast = index === currentIndex;
        const item = state[level];
        
        return (
          <div key={level} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
            <button
              onClick={() => onLevelClick(level)}
              className={`
                hover:text-foreground transition-colors
                ${isLast ? 'text-foreground font-medium' : ''}
                ${!item ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              disabled={!item}
            >
              {item ? item.name : getLevelLabel(level)}
            </button>
          </div>
        );
      })}
    </nav>
  );
} 