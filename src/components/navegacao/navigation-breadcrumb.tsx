'use client'

import { ItemTipo, NavigationState } from '@/types/navigation'
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationBreadcrumbProps {
  itensSelecionados: NavigationState
  nivelAtual: ItemTipo
  aoClicarNivel: (nivel: ItemTipo) => void
}

export function NavigationBreadcrumb({
  itensSelecionados,
  nivelAtual,
  aoClicarNivel
}: NavigationBreadcrumbProps) {
  const niveis = Object.entries(itensSelecionados)
    .filter(([_, item]) => item !== undefined && item !== null)
    .map(([nivel, item]) => ({
      nivel: nivel as ItemTipo,
      item
    }))

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {niveis.map(({ nivel, item }, index) => (
        <div key={nivel} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />}
          <button
            onClick={() => aoClicarNivel(nivel)}
            className={cn(
              "hover:underline",
              nivel === nivelAtual ? "font-medium text-slate-100" : "text-slate-400"
            )}
          >
            {item.nome}
          </button>
        </div>
      ))}
    </nav>
  )
} 