'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle2,
  Menu,
  MessageSquare,
  Settings,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAppStore } from '@/store/useAppStore'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Navegação',
    icon: Search,
    href: '/navegacao',
  },
  {
    label: 'Questões',
    icon: FileText,
    href: '/questions',
  },
  {
    label: 'Respostas',
    icon: MessageSquare,
    href: '/respostas',
  },
  {
    label: 'Correções',
    icon: CheckCircle2,
    href: '/correcoes',
  },
  {
    label: 'Correção em Lote',
    icon: Upload,
    href: '/batch-correction',
  }
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { isSidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <>
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen border-r border-slate-800 bg-[#0A0F1C] md:block transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="h-14 border-b border-slate-800 flex items-center px-4">
          <Link href="/" className="flex items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-100">AVALIAÇÃO</span>
                <span className="text-xs font-medium text-emerald-400">/</span>
                <span className="text-xs font-medium text-emerald-400">AI</span>
              </div>
              {!isSidebarCollapsed && (
                <span className="text-xs font-medium text-slate-100">DO FUTURO</span>
              )}
            </div>
          </Link>
        </div>

        {/* Botão de Toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 p-1 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-400" />
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
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              )}
              title={isSidebarCollapsed ? route.label : undefined}
            >
              <route.icon className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="text-sm font-medium">{route.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Info do Protótipo - No rodapé do menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className={cn(
            "flex flex-col",
            isSidebarCollapsed && "items-center"
          )}>
            <div className="flex items-center gap-2">
              {!isSidebarCollapsed && (
                <span className="text-[10px] text-slate-400 tracking-wider">PROTÓTIPO</span>
              )}
              <span className="text-[10px] text-emerald-400 tracking-wider">v1.0</span>
            </div>
            {!isSidebarCollapsed && (
              <span className="text-[10px] text-slate-500 tracking-wider">TIME DE TECNOLOGIA FDE</span>
            )}
          </div>
        </div>
      </aside>

      {/* Menu Mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="fixed top-4 right-4 md:hidden"
          >
            <Menu className="h-6 w-6 text-slate-400" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] bg-[#0A0F1C] p-0">
          <nav className="grid gap-1 p-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname === route.href 
                    ? "bg-blue-500/10 text-blue-400" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )}
              >
                <route.icon className="h-4 w-4" />
                <span>{route.label}</span>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
} 