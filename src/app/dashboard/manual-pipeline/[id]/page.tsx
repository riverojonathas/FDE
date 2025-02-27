'use client'

import { PipelineOrchestrator } from '@/components/manual-pipeline/pipeline-orchestrator'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface ManualPipelinePageProps {
  params: {
    id: string
  }
}

export default function ManualPipelinePage({ params }: ManualPipelinePageProps) {
  const router = useRouter()

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/manual-pipeline')}
            className="text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          {/* Título e subtítulo removidos como solicitado */}
        </div>
      </div>

      <PipelineOrchestrator correctionId={params.id} />
    </div>
  )
} 