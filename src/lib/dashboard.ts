import { createClient } from '@/lib/supabase/client'

export interface DashboardMetrics {
  totalCorrections: number
  averageTime: number
  averageScore: number
  totalCost: number
  strengths: Array<{ strength: string; count: number }>
  weaknesses: Array<{ weakness: string; count: number }>
}

export interface CorrectionAnalytics {
  correctionId: string
  processingTime: number
  cost: number
  type: 'redacao' | 'resposta'
}

export async function getDashboardMetrics(startDate: Date, endDate: Date): Promise<DashboardMetrics> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('dashboard_metrics')
    .select('*')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: false })
    .limit(1)

  if (error) throw error

  return data?.[0] || {
    totalCorrections: 0,
    averageTime: 0,
    averageScore: 0,
    totalCost: 0,
    strengths: [],
    weaknesses: []
  }
}

export async function saveCorrectionAnalytics(analytics: CorrectionAnalytics) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('correction_analytics')
    .insert({
      correction_id: analytics.correctionId,
      processing_time: analytics.processingTime,
      cost: analytics.cost,
      type: analytics.type
    })

  if (error) throw error
}

export async function getAnalyticsSummary(days: number = 30) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('correction_analytics')
    .select('*')
    .gte('created_at', startDate.toISOString())

  if (error) throw error

  return {
    totalCorrections: data.length,
    averageTime: data.reduce((acc, curr) => acc + curr.processing_time, 0) / data.length,
    totalCost: data.reduce((acc, curr) => acc + curr.cost, 0),
    byType: {
      redacao: data.filter(a => a.type === 'redacao').length,
      resposta: data.filter(a => a.type === 'resposta').length
    }
  }
} 