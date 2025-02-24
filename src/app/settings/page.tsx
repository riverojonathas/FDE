'use client'

import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/ui/page-header"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { Card } from "@/components/ui/card"
import { Users, Cog, Wand2, BarChart } from 'lucide-react'
import Link from 'next/link'

const settingsGroups = [
  {
    title: 'Configurações Gerais',
    items: [
      {
        title: 'Perfil',
        description: 'Gerencie suas informações pessoais e preferências',
        icon: Users,
        href: '/settings/profile'
      },
      {
        title: 'Geral',
        description: 'Configure as opções gerais do sistema',
        icon: Cog,
        href: '/settings/general'
      }
    ]
  },
  {
    title: 'IA & Correções',
    items: [
      {
        title: 'Calibração de Prompts',
        description: 'Analise e aprimore os prompts de correção',
        icon: Wand2,
        href: '/settings/prompts'
      },
      {
        title: 'Métricas & Analytics',
        description: 'Visualize estatísticas e relatórios de desempenho',
        icon: BarChart,
        href: '/settings/metrics'
      }
    ]
  }
]

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <PageHeader
          title="Configurações"
          description="Gerencie todas as configurações do sistema"
        />

        <div className="space-y-8">
          {settingsGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
} 