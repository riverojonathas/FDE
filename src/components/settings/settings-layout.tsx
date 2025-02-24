'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SettingsLayoutProps {
  children: ReactNode
  className?: string
}

export function SettingsLayout({ children, className }: SettingsLayoutProps) {
  return (
    <div className="container mx-auto py-6">
      <Card className={cn("p-6", className)}>
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  )
} 