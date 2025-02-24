import { useState } from 'react';
import { Building2, School, GraduationCap, BookOpen, Users } from 'lucide-react';
import { NavigationLevel, NavigationState } from '@/types/navigation';
import { NavigationHeader } from './components/navigation-header';
import { NavigationList } from './components/navigation-list';
import { NavigationBreadcrumb } from './components/navigation-breadcrumb';

export function NavigationView() {
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>('cidade');
  const [navigationState, setNavigationState] = useState<NavigationState>({});
  const [searchTerm, setSearchTerm] = useState('');

  const levels = [
    { id: 'cidade', label: 'Cidade', icon: Building2 },
    { id: 'escola', label: 'Escola', icon: School },
    { id: 'tipo-ensino', label: 'Tipo de Ensino', icon: GraduationCap },
    { id: 'serie', label: 'Série', icon: BookOpen },
    { id: 'turma', label: 'Turma', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <NavigationHeader 
        currentLevel={currentLevel}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <NavigationBreadcrumb 
        state={navigationState}
        currentLevel={currentLevel}
        onLevelClick={setCurrentLevel}
      />

      <NavigationList 
        level={currentLevel}
        state={navigationState}
        searchTerm={searchTerm}
        onSelect={(item) => {
          setNavigationState(prev => ({ ...prev, [currentLevel]: item }));
          const nextLevel = levels[levels.findIndex(l => l.id === currentLevel) + 1];
          if (nextLevel) {
            setCurrentLevel(nextLevel.id as NavigationLevel);
          }
        }}
      />
    </div>
  );
} 