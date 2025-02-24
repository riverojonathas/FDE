'use client'

import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/ui/page-header"
import { CorrectionList } from '@/components/correction/correction-list'

export default function CorrecoesPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <PageHeader
          title="Correções"
          description="Acompanhe e gerencie as correções das respostas"
        />
        
        <CorrectionList />
      </div>
    </MainLayout>
  )
} 