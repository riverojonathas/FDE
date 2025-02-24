'use client'

import { MainLayout } from "@/components/layout/main-layout"
import { NavegacaoHierarquica } from '@/components/navegacao/navegacao-hierarquica'
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function NavegacaoPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <PageHeader
          title="Navegação"
          description="Navegue pela estrutura escolar de forma simples e organizada"
        />
        
        <div className="flex items-center space-x-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar cidade..." 
              className="pl-9 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <NavegacaoHierarquica />
        </div>
      </div>
    </MainLayout>
  )
} 