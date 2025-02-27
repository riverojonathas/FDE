'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { 
  LayoutDashboard,
  FileText,
  MessageSquare,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  // Removendo a opção de navegação do sidebar
  // {
  //   label: 'Navegação',
  //   icon: Search,
  //   href: '/navegacao',
  // },
  {
    label: 'Questões',
    icon: FileText,
    href: '/questions',
  },
  // Removendo a opção de navegação do sidebar
  // {
  //   label: 'Respostas',
  //   icon: MessageSquare,
  //   href: '/respostas',
  // },
  // Removendo a opção de navegação do sidebar
  // {
  //   label: 'Correção em Lote',
  //   icon: Upload,
  //   href: '/batch-correction',
  // },
  {
    label: 'Corretor 2.0',
    icon: Bot,
    href: '/dashboard/manual-pipeline',
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { isSidebarCollapsed, toggleSidebar } = useAppStore()

  const generateFullPrompt = (step: IPipelineStep) => {
    // Inclui:
    // - Texto a ser analisado
    // - Análises anteriores
    // - Instruções do step atual
    // - Formato esperado da resposta
  }

  const getExpectedFormat = (step: IPipelineStep) => {
    // Retorna o formato JSON esperado para cada tipo de step:
    // - step-1: Análise Inicial (pontos principais, argumentos, ideias)
    // - step-2: Avaliação Técnica (estrutura, coesão, coerência)
    // - step-3: Feedback Final (feedback geral, pontos fortes/fracos, sugestões)
  }

  return (
    <aside className={cn(
      "fixed top-14 left-0 h-[calc(100vh-3.5rem)] border-r border-border bg-background transition-all duration-300 hidden md:block",
      isSidebarCollapsed ? "w-16" : "w-64"
    )}>
      {/* Botão de Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 p-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Menu de Navegação */}
      <nav className="grid gap-1 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg transition-colors",
              isSidebarCollapsed ? "px-2 py-2.5" : "px-4 py-2.5",
              pathname === route.href 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            title={isSidebarCollapsed ? route.label : undefined}
          >
            <route.icon className="h-4 w-4" />
            {!isSidebarCollapsed && <span className="text-sm font-medium">{route.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Info do Protótipo */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className={cn(
          "flex flex-col",
          isSidebarCollapsed && "items-center"
        )}>
          <div className="flex items-center gap-2">
            {!isSidebarCollapsed && (
              <span className="text-[10px] text-muted-foreground tracking-wider">PROTÓTIPO</span>
            )}
            <span className="text-[10px] !text-emerald-500 font-semibold tracking-wider">v1.0</span>
          </div>
          {!isSidebarCollapsed && (
            <span className="text-[10px] text-muted-foreground/60 tracking-wider">TIME DE TECNOLOGIA FDE</span>
          )}
        </div>
      </div>
    </aside>
  )
} 