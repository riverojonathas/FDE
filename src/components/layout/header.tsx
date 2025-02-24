'use client'

import { Button } from "@/components/ui/button"
import { Code, Settings } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-800 bg-[#0A0F1C]">
      <div className="flex h-full items-center px-4">
        {/* Logo Principal */}
        <div className="flex items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-100">AVALIAÇÃO</span>
              <span className="text-xs font-medium text-emerald-400">/</span>
              <span className="text-xs font-medium text-emerald-400">AI</span>
            </div>
            <span className="text-xs font-medium text-slate-100">DO FUTURO</span>
          </div>
        </div>

        {/* Configurações (lado direito) */}
        <div className="ml-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            asChild
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
          >
            <Link href="/api">
              <Code className="h-4 w-4 mr-2" />
              API
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            asChild
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
          >
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
} 