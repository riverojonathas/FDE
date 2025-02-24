'use client'

import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/ui/page-header"
import { BatchCorrection } from '@/components/correction/batch-correction'

export default function BatchCorrectionPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <PageHeader
          title="Correção em Lote"
          description="Processe múltiplas correções simultaneamente"
        />
        
        <BatchCorrection />
      </div>
    </MainLayout>
  )
} 