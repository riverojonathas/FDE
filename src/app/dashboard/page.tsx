'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  FileText, 
  LayoutDashboard, 
  Users,
  User,
  CalendarDays
} from 'lucide-react'

// Interfaces
interface StatisticCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  loading?: boolean
  footer?: React.ReactNode
}

// Card de estatística
const StatisticCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  loading = false,
  footer
}: StatisticCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
      {footer && <CardFooter className="pt-2 px-4 border-t">{footer}</CardFooter>}
    </Card>
  )
}

// Componente principal
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCorrections: 0,
    pendingCorrections: 0,
    completedCorrections: 0,
    totalStudents: 0,
    activeClasses: 0,
    avgScore: 0
  })
  
  // Dados para gráficos (simulados)
  const [correctionsByDay, setCorrectionsByDay] = useState<any[]>([])
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([])
  const [studentActivity, setStudentActivity] = useState<any[]>([])
  const [recentCorrections, setRecentCorrections] = useState<any[]>([])
  
  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      // Esperar um pouco para simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Estatísticas
      setStats({
        totalCorrections: 1245,
        pendingCorrections: 28,
        completedCorrections: 1217,
        totalStudents: 187,
        activeClasses: 12,
        avgScore: 7.6
      })
      
      // Correções por dia (últimos 7 dias)
      const today = new Date()
      const correctionData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(today.getDate() - (6 - i))
        return {
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          total: Math.floor(Math.random() * 20) + 5,
          automated: Math.floor(Math.random() * 15) + 5,
          reviewed: Math.floor(Math.random() * 10)
        }
      })
      setCorrectionsByDay(correctionData)
      
      // Distribuição de notas
      const distributionData = [
        { range: '0-1', count: 5 },
        { range: '1-2', count: 8 },
        { range: '2-3', count: 12 },
        { range: '3-4', count: 18 },
        { range: '4-5', count: 29 },
        { range: '5-6', count: 45 },
        { range: '6-7', count: 78 },
        { range: '7-8', count: 102 },
        { range: '8-9', count: 86 },
        { range: '9-10', count: 37 }
      ]
      setScoreDistribution(distributionData)
      
      // Atividade dos alunos (últimos 6 meses)
      const activityData = [
        { month: 'Jan', submissions: 82, unique: 56 },
        { month: 'Fev', submissions: 98, unique: 67 },
        { month: 'Mar', submissions: 125, unique: 79 },
        { month: 'Abr', submissions: 145, unique: 89 },
        { month: 'Mai', submissions: 132, unique: 93 },
        { month: 'Jun', submissions: 158, unique: 115 }
      ]
      setStudentActivity(activityData)
      
      // Correções recentes
      const recentData = [
        { id: 'cor_1', student: 'João Silva', class: '3º Ano A', question: 'Redação ENEM: Educação Digital', score: 8.7, date: '10/06/2023 14:30', status: 'complete', reviewed: true },
        { id: 'cor_2', student: 'Maria Santos', class: '3º Ano B', question: 'Dissertação: Desafios Ambientais', score: 7.5, date: '10/06/2023 11:22', status: 'complete', reviewed: true },
        { id: 'cor_3', student: 'Pedro Oliveira', class: '2º Ano A', question: 'Argumentativa: Ética na IA', score: 6.8, date: '09/06/2023 16:45', status: 'complete', reviewed: false },
        { id: 'cor_4', student: 'Ana Costa', class: '3º Ano A', question: 'Redação ENEM: Educação Digital', score: 9.2, date: '09/06/2023 10:15', status: 'complete', reviewed: true },
        { id: 'cor_5', student: 'Lucas Pereira', class: '2º Ano B', question: 'Dissertação: Desafios Ambientais', score: 5.9, date: '08/06/2023 15:37', status: 'complete', reviewed: false }
      ]
      setRecentCorrections(recentData)
      
      // Concluir carregamento
      setLoading(false)
    }
    
    loadData()
  }, [])
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded shadow p-2 text-xs">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de correção automática
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/corrections">
              <FileText className="h-4 w-4 mr-2" />
              Ver Correções
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/corrections/new">
              <FileText className="h-4 w-4 mr-2" />
              Nova Correção
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          title="Total de Correções"
          value={stats.totalCorrections.toLocaleString('pt-BR')}
          icon={<FileText />}
          loading={loading}
          description={`${stats.pendingCorrections} pendentes de revisão`}
          footer={
            <Link 
              href="/dashboard/corrections" 
              className="flex items-center text-xs text-blue-600 hover:underline"
            >
              Ver todas
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          }
        />
        
        <StatisticCard
          title="Nota Média"
          value={stats.avgScore.toFixed(1)}
          icon={<CheckCircle />}
          loading={loading}
          description="Média de todas as correções"
        />
        
        <StatisticCard
          title="Estudantes"
          value={stats.totalStudents.toLocaleString('pt-BR')}
          icon={<Users />}
          loading={loading}
          description={`Em ${stats.activeClasses} turmas ativas`}
          footer={
            <Link 
              href="/dashboard/students" 
              className="flex items-center text-xs text-blue-600 hover:underline"
            >
              Gerenciar estudantes
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          }
        />
        
        <StatisticCard
          title="Taxa de Revisão"
          value={`${((stats.completedCorrections / (stats.totalCorrections || 1)) * 100).toFixed(1)}%`}
          icon={<Clock />}
          loading={loading}
          description={`${stats.completedCorrections} correções revisadas`}
        />
      </div>
      
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Atividade
          </TabsTrigger>
          <TabsTrigger value="scores">
            <BookOpen className="h-4 w-4 mr-2" />
            Desempenho
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Recentes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4 pt-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Correções por Dia</CardTitle>
                <CardDescription>Atividade dos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={correctionsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="automated" 
                        name="Automáticas" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="reviewed" 
                        name="Revisadas" 
                        stackId="1"
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Atividade dos Alunos</CardTitle>
                <CardDescription>Submissões nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={studentActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="submissions" 
                        name="Total de Submissões"
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="unique" 
                        name="Alunos Únicos"
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="scores" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Notas</CardTitle>
              <CardDescription>Todas as correções</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      name="Quantidade"
                      fill="#8884d8" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Correções Recentes</CardTitle>
              <CardDescription>Últimas 5 correções realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCorrections.map((correction) => (
                    <div 
                      key={correction.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-md"
                    >
                      <div className="flex items-start sm:items-center gap-2">
                        <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{correction.student}</div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                            <span>{correction.class}</span>
                            <span className="hidden sm:inline-block">•</span>
                            <span className="truncate max-w-[220px]">{correction.question}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row-reverse sm:flex-row items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                        <Badge 
                          variant={
                            !correction.reviewed ? "outline" :
                            correction.score >= 7 ? "success" : 
                            correction.score >= 5 ? "warning" : 
                            "destructive"
                          }
                        >
                          {correction.score.toFixed(1)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {correction.date}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="h-8"
                        >
                          <Link href={`/dashboard/corrections/${correction.id}`}>
                            <div className="flex items-center">
                              Ver
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </div>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/corrections">
                  Ver todas as correções
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 